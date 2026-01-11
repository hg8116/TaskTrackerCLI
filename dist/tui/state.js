import { readAllTasks, writeAllTasks } from "../core/taskServices.js";
export let currentTasks = [];
export async function loadState() {
    currentTasks = await readAllTasks();
}
export async function saveState(tasks) {
    currentTasks = tasks;
    await writeAllTasks(tasks);
}
