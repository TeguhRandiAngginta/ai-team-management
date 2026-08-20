import React from 'react';
import TaskCard from './TaskCard';

export default function KanbanColumn({ title, status, taskList = [], headerColor, bgColor, user, onDrop, cardActions }) {
    const isCompact = status === 'done' || status === 'archived';

    const handleDragOver = (e) => e.preventDefault();
    const handleDrop = (e) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        if (taskId) onDrop(taskId, status);
    };

    const checkAccess = (task) => {
        if (!user) return false;
        if (user.role !== 'karyawan') return true; 
        const isAssignee = task.assignees?.some(a => a.id === user.id);
        const isAuthor = task.author_id === user.id;
        return isAssignee || isAuthor;
    };

    return (
        <div className={`${bgColor} min-w-[320px] max-w-[320px] shrink-0 rounded-[2rem] p-5 min-h-[600px] border border-gray-100 transition-colors flex flex-col snap-start`} onDragOver={handleDragOver} onDrop={handleDrop}>
            <div className="flex items-center justify-between mb-5 px-2">
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-gray-700 flex items-center gap-2"><span className={`w-3 h-3 rounded-full ${headerColor}`}></span>{title}</h4>
                <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-gray-500 shadow-sm border border-gray-100">{taskList?.length || 0}</span>
            </div>
            <div className="space-y-4 flex-1">
                {taskList?.length > 0 ? taskList.map(task => (
                    <TaskCard key={task.id} task={task} hasAccess={checkAccess(task)} isCompact={isCompact} {...cardActions} />
                )) : <div className="h-full min-h-[100px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl"><span className="text-xs font-medium text-gray-400">Area Kosong</span></div>}
            </div>
        </div>
    );
}