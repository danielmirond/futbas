type FormResult = 'W' | 'D' | 'L'

interface FormIndicatorProps {
  form: FormResult[]
}

const resultClass: Record<FormResult, string> = {
  W: 'form-dot form-dot-w',
  D: 'form-dot form-dot-d',
  L: 'form-dot form-dot-l',
}

const resultLabel: Record<FormResult, string> = {
  W: 'V',
  D: 'E',
  L: 'D',
}

export function FormIndicator({ form }: FormIndicatorProps) {
  return (
    <div className="flex items-center gap-1">
      {form.map((result, i) => (
        <span key={i} className={resultClass[result]}>
          {resultLabel[result]}
        </span>
      ))}
    </div>
  )
}
