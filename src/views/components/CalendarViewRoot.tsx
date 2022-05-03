import { useApp } from '@/hooks/app';
import * as React from 'react';
import { DatePicker } from './DatePicker';

export const CalendarViewRoot = () => {
	const { vault } = useApp();
	return (
		<>
			<h3>Hello World!!! {vault.getName()}</h3>
			<DatePicker />
		</>
	);
};
