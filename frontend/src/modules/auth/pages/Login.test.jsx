import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Login from './Login'

const loginMock = vi.fn()

vi.mock('@/providers/useAuth', () => ({
  useAuth: () => ({
    login: loginMock,
  }),
}))

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  )
}

/** Solo el botón de enviar el formulario (no el de SENA ID) */
function getSubmitButton() {
  return screen.getByRole('button', {
    name: (accessibleName) =>
      accessibleName.trim().toLowerCase() === 'iniciar sesión',
  })
}

describe('Login', () => {
  beforeEach(() => {
    loginMock.mockReset()
  })

  it('should render the login form with email, password and submit button', () => {
    renderLogin()

    expect(
      screen.getByRole('heading', { name: /iniciar sesión/i })
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument()
    expect(getSubmitButton()).toBeInTheDocument()
  })

  it('should call login with email and password when the form is submitted', async () => {
    const user = userEvent.setup()
    loginMock.mockResolvedValue({ rol_id: 1 })
    renderLogin()

    await user.type(
      screen.getByLabelText(/correo electrónico/i),
      'admin@test.com'
    )
    await user.type(screen.getByLabelText(/^contraseña$/i), 'Admin123!')
    await user.click(getSubmitButton())

    expect(loginMock).toHaveBeenCalledWith('admin@test.com', 'Admin123!')
  })

  it('should show an error message when login fails', async () => {
    const user = userEvent.setup()
    loginMock.mockRejectedValue(new Error('Credenciales inválidas'))
    renderLogin()

    await user.type(
      screen.getByLabelText(/correo electrónico/i),
      'malo@test.com'
    )
    await user.type(screen.getByLabelText(/^contraseña$/i), 'wrong')
    await user.click(getSubmitButton())

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /credenciales inválidas/i
    )
  })
})