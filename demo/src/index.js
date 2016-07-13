import cx from 'classnames'
import React from 'react'
import ReactDOM from 'react-dom'
// These imports are aliased to ~/src, so you are welcome to mess with
// their source code :)
import reformed from 'react-reformed'
import compose from 'react-reformed/lib/compose'
import syncWith from 'react-reformed/lib/syncWith'
import validateSchema from 'react-reformed/lib/validateSchema'

/*
 * Here you can create your base form component.
 *
 * Look at how small and sleek it is.
 */
const MyForm = ({ bindInput, model, onSubmit, schema }) => {
  const submitHandler = (e) => {
    e.preventDefault()
    onSubmit(model)
  }
  const isUsernameValid = schema.fields.username.isValid
  const isPasswordValid = schema.fields.password.isValid

  return (
    <form onSubmit={submitHandler}>
      <fieldset className={cx('form-group', { 'has-danger': !isUsernameValid })}>
        <label htmlFor='username'>Username</label>
        <input
          type='text'
          className='form-control'
          placeholder='Username'
          {...bindInput('username')}
        />
      </fieldset>
      <fieldset className={cx('form-group', { 'has-danger': !isPasswordValid })}>
        <label htmlFor='password'>Password</label>
        <input
          type='text'
          className='form-control'
          placeholder='Password'
          {...bindInput('password')}
        />
      </fieldset>
      <button type='submit' className='btn btn-primary' disabled={!schema.isValid}>
        Submit
      </button>
    </form>
  )
}

/*
 * Let's build our form's container component. We can save our composition so
 * that it can be re-used across the application once you figure out what
 * your needs are!
 *
 * Here, we'll apply some simple validation rules and also configure our form
 * to sync to local storage.
 */
const createFormContainer = compose(
  reformed(),
  validateSchema({
    username: {
      required: true,
      maxLength: 8,
    },
    password: {
      test: (value, fail) => {
        if (!value || value.length < 5) {
          return fail('Password must be at least 5 characters')
        } else if (value.length > 12) {
          return fail('Password must be no longer than 12 characters')
        }
      }
    }
  }),
  syncWith(
    'myForm',
    (key) => JSON.parse(localStorage.getItem(key)),
    (key, value) => localStorage.setItem(key, JSON.stringify(value))
  ),
)

/**
 * Oh, yeah, that `createFormContainer` is just a function... so we can
 * always just compose it alongside other functions. Let's write a
 * generic HoC to display our form state below it.
 */
const displayFormState = (WrappedComponent) => {
  return (props) => {
    return (
      <div>
        {React.createElement(WrappedComponent, props)}
        <hr />
        <h4>Model</h4>
        {JSON.stringify(props.model, null, 2)}
        <hr />
        <h4>Schema Validation</h4>
        {JSON.stringify(props.schema, null, 2)}
      </div>
    )
  }
}

/*
 * Time to create our final form component... this is what you'd
 * ultimately export if you had a real application structure.
 * And hey, Look at that, a totally composed form that displays
 * its model, syncs to * local storage, and does some basic
 * validation in less than 100 lines of component-specific code.
 */
const MyFormContainer = compose(
  createFormContainer,
  displayFormState
)(MyForm)

/*
 * And... render our form.
 */
class App extends React.Component {
  _onSubmit = (model) => {
    // noop
  }

  render () {
    return (
      <div className='container' style={{ marginTop: '2rem' }}>
        <h1>React Reformed</h1>
        <h2>Make forms <del>great</del> simple again.</h2>
        <p>
          This form also syncs your state to local storage... try reloading
          the page after entering some information.
        </p>
        <MyFormContainer onSubmit={this._onSubmit} />
      </div>
    )
  }
}

ReactDOM.render(<App />, window.root)
