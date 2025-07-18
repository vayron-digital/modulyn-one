import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button, Input, FormGroup } from '@/components/ui';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

function Todos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTodo, setNewTodo] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setTodos(data);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    
    if (!newTodo.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([{ title: newTodo, completed: false }])
        .select();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setTodos([...data, ...todos]);
        setNewTodo('');
      }
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  }

  async function toggleTodo(id: number, completed: boolean) {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed: !completed })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, completed: !completed } : todo
      ));
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  }

  async function deleteTodo(id: number) {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 mt-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Todo List</h2>
      
      <form onSubmit={addTodo} className="mb-6">
        <div className="flex">
          <FormGroup label="Add a new todo...">
            <Input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new todo..."
            />
          </FormGroup>
          <Button type="submit" className="rounded-r-md">
            Add
          </Button>
        </div>
      </form>
      
      {loading ? (
        <div className="text-center py-4">
          <p className="text-gray-500">Loading todos...</p>
        </div>
      ) : todos.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-500">No todos yet. Add one above!</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li 
              key={todo.id} 
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id, todo.completed)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className={`ml-3 ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                  {todo.title}
                </span>
              </div>
              <Button onClick={() => deleteTodo(todo.id)} variant="destructive">
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Todos; 