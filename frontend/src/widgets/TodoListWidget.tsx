import React from 'react';
import { CheckCircle, Mail, FileText, Calendar } from 'lucide-react';

interface TodoItem {
  id?: string;
  icon: React.ReactNode;
  text: string;
}

interface TodoListWidgetProps {
  todos: TodoItem[];
}

const TodoListWidget: React.FC<TodoListWidgetProps> = React.memo(({ todos }) => (
  <ul className="space-y-2">
    {todos.map((item, idx) => (
      <li key={item.id || `todo-${idx}-${item.text}`} className="flex items-center gap-2 text-black">
        {item.icon}
        {item.text}
      </li>
    ))}
  </ul>
));

TodoListWidget.displayName = 'TodoListWidget';

export default TodoListWidget; 