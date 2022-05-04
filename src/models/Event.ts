import { EventResult } from '@/types';
import { getTemplateContents } from '@/utils/template';
import { App } from 'obsidian';

const EVENT_TEMPLATE = '_assets/templates/t_event';

export class Event {
	#event: EventResult;

	constructor(e: EventResult) {
		this.#event = e;
	}

	generateFromTemplate = async (app: App) => {
		const rawTemplate = await getTemplateContents(app, EVENT_TEMPLATE);
		return this.applyTemplateTransformations(rawTemplate);
	};

	private applyTemplateTransformations = (rawTemplateContents: string): string => {
		let templateContents = rawTemplateContents;
		const startMoment = window.moment(this.#event.startTime);

		const transform = {
			summary: this.#event.summary,
			description: this.#event.description,
			start: startMoment.format('ddd, MMM Do @ hh:mma'),
			link: this.#event.htmlLink,
			organizer: this.#event.organizer,
			attendees: this.#event.attendees
				.map((a) => {
					return `${a.email} ${a.response === 'declined' ? '(x)' : a.response === 'tentative' ? '(?)' : ''}`;
				})
				.join(', '),
			source: this.#event.accountSource.toLocaleLowerCase()
		};

		for (const [k, v] of Object.entries(transform)) {
			templateContents = templateContents.replace(new RegExp(`{{\\s*${k}\\s*}}`, 'gi'), v);
		}
		templateContents = templateContents
			.replace(/{{\s*date\s*}}/gi, window.moment().format('YYYY-MM-DD'))
			.replace(/{{\s*time\s*}}/gi, window.moment().format('HH:mm'));

		return templateContents;
	};
}
