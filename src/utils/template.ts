import { App, normalizePath, Notice } from 'obsidian';

export const getTemplateContents = async (app: App, templatePath: string | undefined): Promise<string> => {
	const { metadataCache, vault } = app;
	const normalizedTemplatePath = normalizePath(templatePath ?? '');
	if (templatePath === '/') {
		return '';
	}

	try {
		const templateFile = metadataCache.getFirstLinkpathDest(normalizedTemplatePath, '');
		return templateFile ? vault.cachedRead(templateFile) : '';
	} catch (err) {
		console.error(`Failed to read the person template from '${normalizedTemplatePath}'`, err);
		new Notice('Failed to read the daily note template');
		return '';
	}
};
