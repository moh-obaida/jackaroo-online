import React from 'react';

type FormFieldProps = {
  label: string;
  hint?: string;
  children: React.ReactNode;
};

export function FormField({ label, hint, children }: FormFieldProps) {
  return (
    <div className="form-field">
      <label className="form-field__label">{label}</label>
      {children}
      {hint && <p className="form-field__hint">{hint}</p>}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`input-field ${props.className ?? ''}`} />;
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`select-field ${props.className ?? ''}`} />;
}
