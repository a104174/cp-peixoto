export function FormFieldError({ id, message }: { id: string; message?: string }) {
  return message ? <small className="bo-field-error" id={id}>{message}</small> : null;
}

