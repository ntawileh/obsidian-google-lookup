import { AppContext } from '@/utils/context';
import { App } from 'obsidian';
import * as React from 'react';

export const useApp = (): App => {
	return React.useContext(AppContext);
};
