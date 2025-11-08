import { HiCheckCircle, HiOutlineCheckCircle } from 'react-icons/hi';

function TodoCard({ item, onUpdate }) {
  const todos = item.keyPoints || [];

  const toggleTodo = (index) => {
    // This is a simple implementation - you'd want to track completion state properly
    console.log('Toggle todo:', index);
  };

  return (
    <>
      <h3 className="text-lg font-semibold text-white mb-4">{item.title}</h3>

      <div className="space-y-2">
        {todos.map((todo, index) => (
          <div
            key={index}
            className="flex items-start space-x-3 p-2 rounded-lg hover:bg-dark-700/50 transition-colors cursor-pointer"
            onClick={() => toggleTodo(index)}
          >
            <HiOutlineCheckCircle className="text-xl text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-300">{todo}</span>
          </div>
        ))}
      </div>

      {item.summary && (
        <p className="text-xs text-gray-500 mt-4 italic">{item.summary}</p>
      )}
    </>
  );
}

export default TodoCard;
