import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { UserGroupIcon } from '@heroicons/react/24/outline';

interface TeamMember {
  id: string;
  user_id: string;
  reporting_to: string | null;
  team_id: string;
  position: string;
  level: number;
  user: {
    full_name: string;
    role: string;
    designation: string;
  };
  team: {
    name: string;
  };
}

interface TreeNode {
  id: string;
  name: string;
  role: string;
  designation: string;
  team: string;
  children: TreeNode[];
}

export default function TeamHierarchy() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'tree' | 'list'>('tree');

  useEffect(() => {
    fetchTeamHierarchy();
  }, []);

  const fetchTeamHierarchy = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('team_hierarchy')
        .select(`
          id,
          user_id,
          reporting_to,
          team_id,
          position,
          level,
          user:profiles!user_id (
            full_name,
            role,
            designation
          ),
          team:teams!team_id (
            name
          )
        `)
        .order('level');

      if (error) throw error;
      setMembers(data);
    } catch (error: any) {
      console.error('Error fetching team hierarchy:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const buildTree = (): TreeNode[] => {
    const tree: TreeNode[] = [];
    const map: { [key: string]: TreeNode } = {};

    // First pass: create all nodes
    members.forEach(member => {
      map[member.user_id] = {
        id: member.user_id,
        name: member.user.full_name,
        role: member.user.role,
        designation: member.user.designation,
        team: member.team.name,
        children: []
      };
    });

    // Second pass: build the tree
    members.forEach(member => {
      if (member.reporting_to) {
        const parent = map[member.reporting_to];
        if (parent) {
          parent.children.push(map[member.user_id]);
        }
      } else {
        tree.push(map[member.user_id]);
      }
    });

    return tree;
  };

  const renderTreeNode = (node: TreeNode, level: number = 0) => {
    return (
      <div key={node.id} className="ml-4">
        <div className="flex items-center space-x-2">
          <div className="flex-shrink-0">
            <UserGroupIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {node.name}
            </p>
            <p className="text-sm text-gray-500">
              {node.designation} - {node.team}
            </p>
          </div>
        </div>
        {node.children.map(child => renderTreeNode(child, level + 1))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Team Hierarchy</h1>
          <p className="mt-2 text-sm text-gray-700">
            View and manage your team's organizational structure.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setView('tree')}
              className={`inline-flex items-center px-4 py-2 border ${
                view === 'tree'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-300 bg-white text-gray-700'
              } rounded-md shadow-sm text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              Tree View
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={`inline-flex items-center px-4 py-2 border ${
                view === 'list'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-300 bg-white text-gray-700'
              } rounded-md shadow-sm text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              List View
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="mt-8">
        {view === 'tree' ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              {buildTree().map(node => renderTreeNode(node))}
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Designation
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <UserGroupIcon className="h-10 w-10 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {member.user.full_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.user.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.user.designation}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.team.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.level}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 