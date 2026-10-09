interface ConsentCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
}

export function ConsentCheckbox({ checked, onChange, error }: ConsentCheckboxProps) {
  return (
    <div>
      <label className="flex items-start gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary focus:ring-primary"
        />
        <span className="text-sm text-text-secondary">
          Я согласен(а) на обработку персональных данных в соответствии с{' '}
          <a
            href="/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary-dark underline"
          >
            Политикой обработки персональных данных
          </a>
        </span>
      </label>
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}
