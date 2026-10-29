import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Input from './Input';

describe('Input', () => {
  it('llama onChange al escribir en el input', () => {
    const onChange = vi.fn();
    render(<Input label="Correo" value="" onChange={onChange} />);

    const input = screen.getByLabelText('Correo');
    fireEvent.change(input, { target: { value: 'a@b.com' } });

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('muestra el asterisco cuando required=true', () => {
    render(<Input label="Correo" required value="" onChange={() => {}} />);

    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo/)).toBeRequired();
  });

  it('no dispara onChange si el input está disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input label="Correo" disabled value="" onChange={onChange} />);

    const input = screen.getByLabelText('Correo');
    expect(input).toBeDisabled();

    await user.type(input, 'x');
    expect(onChange).not.toHaveBeenCalled();
  });
});
