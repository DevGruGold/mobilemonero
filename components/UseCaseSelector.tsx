interface UseCaseSelectorProps {
  selectedUseCase: string;
  setSelectedUseCase: (useCase: string) => void;
}

export default function UseCaseSelector({ selectedUseCase, setSelectedUseCase }: UseCaseSelectorProps) {
  const useCases = [
    { value: 'dinner', label: 'Make Dinner' },
    { value: 'tire', label: 'Fix a Flat Tire' },
    { value: 'table', label: 'Refinish a Table' },
  ];

  return (
    <div className="mb-6">
      <label htmlFor="use-case" className="block text-sm font-medium text-gray-700 mb-2">
        What do you need help with?
      </label>
      <select
        id="use-case"
        value={selectedUseCase}
        onChange={(e) => setSelectedUseCase(e.target.value)}
        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
      >
        {useCases.map((useCase) => (
          <option key={useCase.value} value={useCase.value}>
            {useCase.label}
          </option>
        ))}
      </select>
    </div>
  )
}
