import { DEFAULT_EVENT_TEMPLATE } from '@/settings/default-templates';
import { EventResult } from '@/types';
import { getTemplateContents } from '@/utils/template';
import { App, moment } from 'obsidian';

export class Event {
	#event: EventResult;
	#template: string | undefined;
	#dateFormat: string | undefined;

	constructor(e: EventResult, templateFile: string | undefined, dateFormat: string | undefined) {
		this.#event = e;
		this.#template = templateFile;
		this.#dateFormat = dateFormat;
	}

	generateFromTemplate = async (app: App) => {
		const rawTemplate = await getTemplateContents(app, this.#template);
		return this.applyTemplateTransformations(
			rawTemplate && rawTemplate.length > 0 ? rawTemplate : DEFAULT_EVENT_TEMPLATE
		);
	};

	private applyTemplateTransformations = (rawTemplateContents: string): string => {
		let templateContents = rawTemplateContents;
		const startMoment = moment(this.#event.startTime);
		const endMoment = moment(this.#event.endTime);
		const now = moment();

		const transform = {
			id: this.#event.id,
			recurringId: this.#event.recurringId,
			summary: this.#event.summary,
			description: this.#event.description,
			start: startMoment.format(this.#dateFormat ?? 'ddd, MMM Do @ hh:mma'),
			end: endMoment.isValid() ? endMoment.format(this.#dateFormat ?? 'ddd, MMM Do @ hh:mma') : '',
			link: this.#event.htmlLink,
			organizer: this.#event.organizer,
			attendees: this.#event.attendees
				.map((a) => {
					return `${a.email}${a.response === 'declined' ? ' (x)' : a.response === 'tentative' ? ' (?)' : ''}`;
				})
				.join(', '),
			'attendees.name': this.#event.attendees
				.map((a) => {
					return `${a.name ? a.name : a.email}${
						a.response === 'declined' ? ' (x)' : a.response === 'tentative' ? ' (?)' : ''
					}`;
				})
				.join(', '),

			source: this.#event.accountSource.toLocaleLowerCase(),
			status: this.#event.status,
			eventType: this.#event.eventType,
			location: this.#event.location,
			attachments: this.#event.attachments
				.map((att) => {
					return `- [${att.title ?? 'Attachment'}](${att.fileUrl})${
						att.mimeType ? ' (' + att.mimeType + ')' : ''
					}${att.iconUrl ? ` ![](${att.iconUrl})` : ''}`;
				}).join('\n'),
			conference: this.#event.conferenceData
				? this.#event.conferenceData.entryPoints
					.map((ep) => {
						return `- [${ep.label ?? 'Link'}](${ep.uri}) (${ep.entryPointType})`;
					}).join('\n')
				: '',
			'conference.solution': this.#event.conferenceData?.solutionName ?? '',
			json: JSON.stringify(this.#event, null, 2)
		};

		for (const [k, v] of Object.entries(transform)) {
			templateContents = templateContents.replace(new RegExp(`{{\s*${k}\s*}}`, 'gi'), v);
		}
		templateContents = templateContents
			.replace(/{{\s*date\s*}}/gi, now.format('YYYY-MM-DD'))
			.replace(/{{\s*time\s*}}/gi, now.format('HH:mm'));

		return templateContents;
	};
}
