import { calendar_v3, calendar } from '@googleapis/calendar';
import { getAuthClient } from './auth';
import { EventResult, GoogleServiceOptions } from '@/types';

interface QueryOptions {
	service: calendar_v3.Calendar;
	accountName: string;
}

export const getCalendarService = async ({ credentials, token }: GoogleServiceOptions) => {
	const auth = await getAuthClient(credentials, token);

	return calendar({
		version: 'v3',
		auth: auth
	});
};

const buildCalendarEvent = (item: calendar_v3.Schema$Event, accountSource: string): EventResult => {
		const {
			id,
			recurringEventId,
			summary,
			description,
			status,
			eventType,
			attachments,
			htmlLink,
			organizer,
			attendees,
			start,
			end,
			location,
			conferenceData
		} = item;
		return {
			id: id as string,
			recurringId: recurringEventId,
			summary: summary || '',
			description: description || '',
			status: status || '',
			eventType: eventType || '',
			accountSource: accountSource,
			attachments:
				attachments
					?.filter((a) => !!a.fileUrl)
					.map((a) => {
						return {
							title: a.title,
							mimeType: a.mimeType,
							fileUrl: a.fileUrl as string,
							iconUrl: a.iconLink
						};
					}) || [],
			htmlLink,
			organizer: organizer?.email || '',
			attendees:
				attendees
					?.filter((a) => !!a.email)
					.map((a) => {
						return {
							response: a.responseStatus,
							email: a.email,
							name: a.displayName
						};
					}) || [],
			startTime: start?.dateTime,
			endTime: end?.dateTime,
			location: location || null,
			conferenceData: {
				solutionName: conferenceData?.conferenceSolution?.name,
				entryPoints:
					conferenceData?.entryPoints
						?.filter((e) => !!e.entryPointType && !!e.uri)
						.map((e) => ({
							entryPointType: e.entryPointType as string,
							label: e.label,
							uri: e.uri as string,
							password: e.password
						})) || []
			}
		};
};

export const searchCalendarEvents = async (
	query: moment.Moment,
	{ service, accountName }: QueryOptions
): Promise<EventResult[] | undefined> => {
	try {
		const response = await service.events.list({
			calendarId: 'primary',
			maxAttendees: 100,
			singleEvents: true,
			orderBy: 'startTime',
			timeMin: query.startOf('day').format(),
			timeMax: query.endOf('day').format()
		});

		if (response.status !== 200) {
			console.warn(`error querying people api ${response.statusText}`);
			return;
		}

		if (!response.data?.items || response.data?.items?.length === 0) {
			return [];
		}

		return response.data.items
			.filter((item) => !!item.id)
			.map((item) => buildCalendarEvent(item, accountName));
	} catch (err: any) {
		console.warn(`Cannot query calendar service ${err.message}`);
	}
};

export const getCalendarEventById = async (
	eventId: string,
	{ service, accountName }: QueryOptions
): Promise<EventResult | undefined> => {
	try {
		const response = await service.events.get({
			calendarId: 'primary',
			eventId: eventId
		});

		if (response.status !== 200) {
			console.warn(`error querying people api ${response.statusText}`);
			return;
		}

		if (!response.data) {
			return;
		}

		return buildCalendarEvent(response.data, accountName);

	} catch (err: any) {
		console.warn(`Cannot query calendar service ${err.message}`);
	}
};
