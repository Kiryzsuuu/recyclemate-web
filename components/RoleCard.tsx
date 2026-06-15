import clsx from 'clsx'

interface RoleCardProps {
  role: string
  title: string
  description: string
  selected: boolean
  onClick: () => void
}

export default function RoleCard({ title, description, selected, onClick }: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'w-full text-left p-4 rounded-2xl border-2 transition-all',
        selected
          ? 'border-primary-800 bg-primary-50 shadow-sm'
          : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-gray-50'
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className={clsx('font-semibold text-sm', selected ? 'text-primary-800' : 'text-gray-800')}>
            {title}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">{description}</div>
        </div>
        {selected && (
          <div className="w-5 h-5 rounded-full bg-primary-800 flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
    </button>
  )
}
