import { PersonResult } from '@/types';
import { getTemplateContents } from '@/utils/template';
import { App } from 'obsidian';

const PERSON_TEMPLATE = '_assets/templates/t_person';

export class Person {
	#person: PersonResult;

	constructor(p: PersonResult) {
		this.#person = p;
	}

	generateFromTemplate = async (app: App) => {
		const rawTemplate = await getTemplateContents(app, PERSON_TEMPLATE);
		return this.applyTemplateTransformations(rawTemplate);
	};

	private applyTemplateTransformations = (rawTemplateContents: string): string => {
		let templateContents = rawTemplateContents;

		const transform = {
			firstName: this.#person.firstName || '',
			lastName: this.#person.lastName || '',
			firstLast: `${this.#person.firstName}${this.#person.lastName}` || '',
			lastFirst: `${this.#person.lastName}${this.#person.firstName}` || '',
			title: `${this.#person.lastName}, ${this.#person.firstName}` || '',
			emails: this.#person.emails?.join(',') || '',
			phones: this.#person.phones?.join(',') || '',
			'org.title': this.#person.org?.title || '',
			'org.department': this.#person.org?.department || '',
			type: this.#person.type,
			source: this.#person.accountSource.toLocaleLowerCase()
		};

		for (const [k, v] of Object.entries(transform)) {
			templateContents = templateContents.replace(new RegExp(`{{\\s*${k}\\s*}}`, 'gi'), v);
		}
		templateContents = templateContents
			.replace(/{{\s*date\s*}}/gi, window.moment().format('YYYY-MM-DD'))
			.replace(/{{\s*time\s*}}/gi, window.moment().format('HH:mm'));

		return templateContents;
	};

	makeTitle = () => {
		const { firstName, lastName } = this.#person;
		return `${lastName}, ${firstName}`;
	};
}
