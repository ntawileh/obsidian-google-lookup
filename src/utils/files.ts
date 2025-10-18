import { App, Editor, MarkdownView, Notice, TFile, normalizePath } from 'obsidian';

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
	const cursor = editor.getCursor();
	// Use replaceRange with both 'from' and 'to' positions set to cursor
	// to insert without replacing any existing content
	editor.replaceRange(content, cursor, cursor);
};

export const renameFile = async (app: App, title: string, folder: string) => {
	const file: TFile | null = app.workspace.getActiveFile();
	if (!file || !isViewInSourceMode(app.workspace.getActiveViewOfType(MarkdownView))) {
		return;
	}

	try {
		const newPath = `${folder}/${sanitizeHeading(title)}.md`;
		await app.fileManager.renameFile(file, newPath);
	} catch (err: any) {
		console.error(err.message);
		new Notice(`unable to rename/move file - does the folder "${folder}" exist?`, 7000);
	}
};

const sanitizeHeading = (text: string) => {
	const stockIllegalSymbols = /[\\/:|#^[\]]/g;
	text = text.replace(stockIllegalSymbols, '');
	return text.trim();
};

/**
 * Creates a person file in the specified folder if it doesn't exist.
 * Returns the wiki link to the file.
 * If file already exists, it will NOT be modified - just returns the link.
 */
export const createOrUpdatePersonFile = async (
	app: App,
	title: string,
	content: string,
	folder: string
): Promise<string> => {
	const fileName = sanitizeHeading(title);
	const filePath = normalizePath(`${folder}/${fileName}.md`);

	try {
		// Check if file already exists
		const existingFile = app.vault.getAbstractFileByPath(filePath);

		if (existingFile instanceof TFile) {
			// File exists, do NOT modify it - just return the link
			new Notice(`File already exists for ${title}, inserting link`);
		} else {
			// File doesn't exist, create it
			// First ensure the folder exists
			const folderPath = normalizePath(folder);
			const folderExists = app.vault.getAbstractFileByPath(folderPath);

			if (!folderExists && folder) {
				await app.vault.createFolder(folderPath);
			}

			await app.vault.create(filePath, content);
			new Notice(`Created new file for ${title}`);
		}

		// Return wiki link to the file
		return `[[${fileName}]]`;
	} catch (err: any) {
		console.error('Error creating person file:', err);
		new Notice(`Error: ${err.message}`, 7000);
		// Return a fallback - just the title
		return title;
	}
};
