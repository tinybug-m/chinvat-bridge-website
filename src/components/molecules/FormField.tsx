type FormFieldType = "text" | "email" | "tel" | "url" | "select" | "textarea";

interface SelectOption {
  value: string;
  label: string;
}

interface FormFieldProps {
  label: string;
  name: string;
  type?: FormFieldType;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  options?: SelectOption[];
  rows?: number;
  /** The field's purpose for autofill (WCAG 1.3.5), e.g. "email" or "organization". */
  autoComplete?: string;
}

// Matches components/ui/input: control border on paper-raised, ink on hover.
const FIELD_CLASS =
  "w-full min-w-0 rounded-[2px] border border-control bg-paper-raised px-4 text-body text-ink transition-[border-color] duration-200 ease-out-quart placeholder:text-ink-muted hover:border-ink";

export function FormField({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  defaultValue,
  options,
  rows = 3,
  autoComplete,
}: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-small font-medium text-ink"
      >
        {label} {required ? <span className="text-signal-error">*</span> : null}
      </label>
      {type === "select" ? (
        <select
          id={name}
          name={name}
          required={required}
          defaultValue={defaultValue}
          className={`${FIELD_CLASS} h-12 cursor-pointer`}
        >
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          rows={rows}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className={`${FIELD_CLASS} resize-none py-3`}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          defaultValue={defaultValue}
          autoComplete={autoComplete}
          className={`${FIELD_CLASS} h-12`}
        />
      )}
    </div>
  );
}
