import { App, normalizePath } from 'obsidian';

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
		return '';
	}
};

export const makePhotoMarkdownLink = (url?: string | null, alt?: string): string => {
	if (!url) {
		return '';
	}
	return `![${alt ?? url.split('/').pop()}](${url})`;
};
