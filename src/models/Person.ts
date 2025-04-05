import { DEFAULT_PERSON_FILENAME_FORMAT, DEFAULT_PERSON_TEMPLATE } from '@/settings/default-templates';
import { PersonAddress, PersonResult } from '@/types';
import { getTemplateContents, makePhotoMarkdownLink } from '@/utils/template';
import { App, moment } from 'obsidian';

export class Person {
	#person: PersonResult;
	#template: string | undefined;
	#filenameTemplate: string | undefined;

	constructor(p: PersonResult, templateFile: string | undefined, filenameTemplate: string | undefined) {
		this.#person = p;
		this.#template = templateFile;
		this.#filenameTemplate = filenameTemplate;
	}

	generateFromTemplate = async (app: App) => {
		const rawTemplate = await getTemplateContents(app, this.#template);
		return this.applyTemplateTransformations(
			rawTemplate && rawTemplate.length > 0 ? rawTemplate : DEFAULT_PERSON_TEMPLATE
		);
	};

	getContactUrl() {
		if (!this.#person.resourceName) {
			return 'unknown';
		}

		return this.#person.resourceName.replace('people/', 'https://contacts.google.com/person/');
	}

	private transformAddress = (a: Partial<PersonAddress> | null | undefined): string => {
		if (a == null) {
			return '';
		}
		const fields = [a.streetAddress, a.extendedAddress, a.city, a.postalCode, a.poBox, a.countryCode]
			.filter((f) => f && f.length > 0)
			.join(', ');
		return `${a?.type ? a.type.concat(': ') : ''}${fields}`;
	};

	private applyTemplateTransformations = (rawTemplateContents: string): string => {
		let templateContents = rawTemplateContents;
		const now = moment();

		const transform = {
			firstName: this.#person.firstName || '',
			lastName: this.#person.lastName || '',
			middleName: this.#person.middleName || '',
			firstLast: `${this.#person.firstName}${this.#person.lastName}` || '',
			lastFirst: `${this.#person.lastName}${this.#person.firstName}` || '',
			nicknames: this.#person.nicknames?.map((n) => `${n?.value}`).join(', ') || '',
			contactGroups: this.#person.contactGroupMembership?.map((g) => `${g?.replace('contactGroups/', '')}`) || '',
			addresses: this.#person.addresses?.map((a) => `${this.transformAddress(a)}`).join('\n') || '',
			emails: this.#person.emails?.join(', ') || '',
			phones: this.#person.phones?.join(', ') || '',
			birthdays: this.#person.birthdays?.join(', ') || '',
			'org.title': this.#person.org?.title || '',
			'org.department': this.#person.org?.department || '',
			'org.name': this.#person.org?.name || '',
			type: this.#person.type,
			link: this.getContactUrl(),
			source: this.#person.accountSource.toLocaleLowerCase(),
			urls: this.#person.urls?.map((u) => `${u?.type}: ${u?.value}`).join(', ') || '',
			relations: this.#person.relations?.map((r) => `${r?.type}: ${r?.person}`).join(', ') || '',
			clientData: this.#person.clientData?.map((c) => `${c?.key}: ${c?.value}`).join(', ') || '',
			userData: this.#person.userDefinedData?.map((c) => `${c?.key}: ${c?.value}`).join(', ') || '',
			bio: this.#person.bio ?? '',
			photos: this.#person.photos?.map((p) => makePhotoMarkdownLink(p?.url)).join(' ') || '',
			primaryPhoto: makePhotoMarkdownLink(this.#person.photos?.find((p) => p?.primary)?.url) || '',
			json: JSON.stringify(this.#person, null, 2)
		};

		for (const [k, v] of Object.entries(transform)) {
			templateContents = templateContents.replace(new RegExp(`{{\\s*${k}\\s*}}`, 'gi'), v);
		}
		templateContents = templateContents
			.replace(/{{\s*date\s*}}/gi, now.format('YYYY-MM-DD'))
			.replace(/{{\s*time\s*}}/gi, now.format('HH:mm'));

		return templateContents;
	};

	getTitle = () => {
		return this.applyTemplateTransformations(
			this.#filenameTemplate && this.#filenameTemplate.length > 0
				? this.#filenameTemplate
				: DEFAULT_PERSON_FILENAME_FORMAT
		);
	};
}
