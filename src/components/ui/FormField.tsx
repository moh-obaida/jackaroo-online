import React, { useId } from 'react';

type FormFieldProps = {
  label: string;
  hint?: string;
  children: React.ReactElement;
};

export function FormField({ label, hint, children }: FormFieldProps) {
  const fieldId = useId();
  const control = React.cloneElement(children, {
    id: children.props.id ?? fieldId,
    'aria-describedby': hint ? `${fieldId}-hint` : children.props['aria-describedby'],
  });

  return (
    <div className="form-field">
      <label className="form-field__label" htmlFor={control.props.id}>
        {label}
      </label>
      {control}
      {hint && (
        <p className="form-field__hint" id={`${fieldId}-hint`}>
          {hint}
        </p>
      )}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`input-field ${props.className ?? ''}`} />;
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`select-field ${props.className ?? ''}`} />;
}
