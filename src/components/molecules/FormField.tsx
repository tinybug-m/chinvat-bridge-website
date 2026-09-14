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
}

const FIELD_CLASS =
  "w-full bg-obsidian-900 border border-stone-borderLight px-4 py-3 font-sans text-sm text-parchment-100 focus:border-gold-500 focus:ring-0 focus:outline-none transition-colors rounded-sm placeholder:text-parchment-dim/60";

export function FormField({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  defaultValue,
  options,
  rows = 3,
}: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block font-mono text-[10px] text-parchment-200 tracking-technical uppercase mb-1.5"
      >
        {label} {required ? <span className="text-gold-500">*</span> : null}
      </label>
      {type === "select" ? (
        <select
          id={name}
          name={name}
          required={required}
          defaultValue={defaultValue}
          className={`${FIELD_CLASS} cursor-pointer`}
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
          className={`${FIELD_CLASS} resize-none`}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className={FIELD_CLASS}
        />
      )}
    </div>
  );
}
