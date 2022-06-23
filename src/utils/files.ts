import { App, Editor, MarkdownView, TFile } from 'obsidian';

const isViewInSourceMode = (view: MarkdownView | null) => {
	const view_mode = view?.getMode();
	return !!view_mode && view_mode === 'source';
};

export const maybeGetSelectedText = (app: App) => {
	const view = app.workspace.getActiveViewOfType(MarkdownView);
	if (!isViewInSourceMode(view)) {
		return;
	}
	return view?.editor.getSelection();
};

export const insertIntoEditorRange = (app: App, content: string) => {
	const view = app.workspace.getActiveViewOfType(MarkdownView);
	const editor: Editor | undefined = view?.editor;
	if (!editor || !isViewInSourceMode(view)) {
		return;
	}
	editor.replaceRange(content, editor.getCursor());
};

export const renameFile = async (app: App, title: string, folder: string) => {
	const file: TFile | null = app.workspace.getActiveFile();
	if (!file || !isViewInSourceMode(app.workspace.getActiveViewOfType(MarkdownView))) {
		return;
	}

	const newPath = `${folder}/${sanitizeHeading(title)}.md`;
	await app.fileManager.renameFile(file, newPath);
};

const sanitizeHeading = (text: string) => {
	const stockIllegalSymbols = /[\\/:|#^[\]]/g;
	text = text.replace(stockIllegalSymbols, '');
	return text.trim();
};
