import clsx from 'clsx'

interface CategoryChipProps {
  label: string
  active: boolean
  onClick: () => void
}

export default function CategoryChip({ label, active, onClick }: CategoryChipProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
        active
          ? 'bg-primary-800 text-white shadow-sm'
          : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-400 hover:text-primary-800'
      )}
    >
      {label}
    </button>
  )
}
