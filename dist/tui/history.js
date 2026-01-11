export class HistoryManager {
    constructor() {
        this.undoStack = [];
        this.redoStack = [];
    }
    snapshot(tasks) {
        this.undoStack.push(structuredClone(tasks));
        this.redoStack = [];
    }
    undo(current) {
        if (this.undoStack.length === 0)
            return null;
        this.redoStack.push(structuredClone(current));
        return this.undoStack.pop();
    }
    redo(current) {
        if (this.redoStack.length === 0)
            return null;
        this.undoStack.push(structuredClone(current));
        return this.redoStack.pop();
    }
}
