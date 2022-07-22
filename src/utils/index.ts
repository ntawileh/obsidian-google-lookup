import { people_v1 } from '@googleapis/people';

export * from './files';
export * from './template';

export const formatBirthday = ({ year, month, day }: people_v1.Schema$Date): string => {
	return [year, `0${month}`.slice(-2), `0${day}`.slice(-2)].join('-');
};
