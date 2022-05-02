import { App, Editor, MarkdownView, TFile } from 'obsidian';

const PEOPLE_DIR = 'people';

const isViewInSourceMode = (app: App) => {
	const view_mode = app.workspace.getActiveViewOfType(MarkdownView)?.getMode();
	return view_mode && view_mode === 'source';
};

export const maybeGetSelectedText = (app: App) => {
	const view = app.workspace.getActiveViewOfType(MarkdownView);
	if (!isViewInSourceMode(app)) {
		return;
	}
	return view?.editor.getSelection();
};

export const insertIntoEditorRange = (app: App, content: string) => {
	const editor: Editor | undefined = app.workspace.getActiveViewOfType(MarkdownView)?.editor;
	if (!editor || !isViewInSourceMode(app)) {
		return;
	}
	editor.replaceRange(content, editor.getCursor());
};

export const renameFile = async (app: App, title: string) => {
	const file: TFile | null = app.workspace.getActiveFile();
	if (!file || !isViewInSourceMode(app)) {
		return;
	}

	const newPath = `${PEOPLE_DIR}/${sanitizeHeading(title)}.md`;
	await app.fileManager.renameFile(file, newPath);
};

const sanitizeHeading = (text: string) => {
	const stockIllegalSymbols = /[\\/:|#^[\]]/g;
	text = text.replace(stockIllegalSymbols, '');
	return text.trim();
};
