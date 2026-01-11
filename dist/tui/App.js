import React, { useEffect, useState } from 'react';
import { readAllTasks, writeAllTasks } from '../core/taskServices.js';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';
const App = () => {
    const [tasks, setTasks] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [mode, setMode] = useState("list");
    const [editTask, setEditTask] = useState("");
    const [isDirty, setIsDirty] = useState(false);
    const [newTaskDescription, setNewTaskDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const addNewTask = (description) => {
        if (!description.trim())
            return;
        const formattedDate = new Date().toISOString().slice(0, 10);
        const newId = tasks.length === 0 ? 1 : Math.max(...tasks.map(task => task.id)) + 1;
        const newTask = {
            id: newId,
            description,
            status: 'todo',
            createdAt: formattedDate,
            updatedAt: formattedDate
        };
        setTasks(prevTasks => {
            return [...prevTasks, newTask];
        });
    };
    const editTaskDescription = (editedDescription, taskIndex) => {
        if (!editedDescription.trim())
            return;
        tasks[taskIndex].description = editedDescription;
        tasks[taskIndex].updatedAt = new Date().toISOString().slice(0, 10);
        setTasks(tasks);
    };
    const toggleStatus = () => {
        setTasks(prevTasks => {
            setIsDirty(true);
            const newTasks = [...prevTasks];
            const task = newTasks[selectedIndex];
            newTasks[selectedIndex] = {
                ...task,
                status: task.status === "todo" ? "in-progress" : task.status === "in-progress" ? "done" : "todo",
                updatedAt: new Date().toISOString().slice(0, 10)
            };
            return newTasks;
        });
    };
    const deleteTask = () => {
        setTasks(prevTasks => {
            setIsDirty(true);
            setSelectedIndex(prevIndex => {
                if (prevIndex === tasks.length - 1)
                    return prevIndex - 1;
                return prevIndex;
            });
            return prevTasks.filter((_, i) => i !== selectedIndex);
        });
    };
    useEffect(() => {
        const getTasks = async () => {
            const allTasks = await readAllTasks();
            setTasks(allTasks);
        };
        getTasks();
    }, []);
    useInput((input, _) => {
        if (input === 'q') {
            process.exit(0);
        }
    });
    useInput(async (input, _) => {
        if (input === "s" && isDirty && mode === "list") {
            setIsLoading(true);
            await writeAllTasks(tasks);
            setIsLoading(false);
            setIsDirty(false);
            return;
        }
    });
    useInput(async (input, key) => {
        if (mode === "edit" || mode === "add") {
            if (key.escape) {
                setMode("list");
            }
            return;
        }
        if (mode !== 'list')
            return;
        if (key.upArrow) {
            setSelectedIndex(prevIndex => Math.max(0, prevIndex - 1));
        }
        if (key.downArrow) {
            setSelectedIndex(prevIndex => Math.min(tasks.length - 1, prevIndex + 1));
        }
        if (input === "a") {
            setMode("add");
        }
        if (input === "e") {
            setMode("edit");
            setEditTask(tasks[selectedIndex].description);
        }
        if (input === "l") {
            setMode("list");
        }
        if (input === ' ') {
            toggleStatus();
        }
        if (input === 'd') {
            deleteTask();
        }
    });
    return (React.createElement(Box, { flexDirection: 'column' },
        React.createElement(Box, { borderBottom: true, paddingX: 1, flexDirection: 'row' },
            React.createElement(Box, { width: 4 },
                React.createElement(Text, { bold: true }, "ID")),
            React.createElement(Box, { width: 40 },
                React.createElement(Text, { bold: true }, "Description")),
            React.createElement(Box, { width: 20 },
                React.createElement(Text, { bold: true }, "Status"))),
        tasks.map((task, index) => {
            const isSelectedIndex = selectedIndex === index;
            const ROW_BG = isSelectedIndex ? 'blue' : undefined;
            const ROW_COLOR = isSelectedIndex ? 'black' : 'white';
            const statusIcon = task.status === 'done' ? '✔' :
                task.status === 'in-progress' ? '●' : '○';
            return (React.createElement(Box, { key: task.id, backgroundColor: ROW_BG, paddingX: 1, flexDirection: 'row' },
                React.createElement(Box, { width: 4 },
                    React.createElement(Text, { color: ROW_COLOR }, task.id)),
                React.createElement(Box, { width: 40 },
                    React.createElement(Text, { color: ROW_COLOR }, task.description)),
                React.createElement(Box, { width: 20 },
                    React.createElement(Text, { color: ROW_COLOR },
                        statusIcon,
                        " ",
                        task.status))));
        }),
        (mode === "add") &&
            (React.createElement(Box, { flexDirection: 'column' },
                React.createElement(Box, null,
                    React.createElement(Text, { bold: true }, "Enter new task: "),
                    React.createElement(TextInput, { value: newTaskDescription, onChange: setNewTaskDescription, placeholder: 'What do you need to do?', onSubmit: () => {
                            addNewTask(newTaskDescription);
                            setNewTaskDescription("");
                            setMode("list");
                            setIsDirty(true);
                        } })),
                React.createElement(Box, null,
                    React.createElement(Text, { dimColor: true },
                        " ",
                        "\n",
                        "Enter to save . Esc to cancel")))),
        (mode === "edit") &&
            (React.createElement(Box, null,
                React.createElement(TextInput, { value: editTask, onChange: setEditTask, onSubmit: () => {
                        editTaskDescription(editTask, selectedIndex);
                        setEditTask("");
                        setMode("list");
                        setIsDirty(true);
                    } }))),
        React.createElement(Box, { paddingX: 1, paddingTop: 1, gap: 2 },
            React.createElement(Text, null,
                "Mode: ",
                mode),
            React.createElement(Text, null,
                "Status: ",
                isDirty ? "✗ Unsaved" : isLoading ? React.createElement(React.Fragment, null,
                    React.createElement(Spinner, { type: 'dots' }),
                    " \"Saving\"") : "✓ Saved")),
        React.createElement(Box, { paddingX: 1, paddingTop: 1 },
            React.createElement(Text, { dimColor: true }, "\u2191\u2193 Navigate   space Toggle-status   a Add   e Edit    s Save    d Delete    q Quit"))));
};
export default App;
