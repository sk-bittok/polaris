import {
	ErrorStateView,
	LoadingStateView,
} from "@/components/protected/utilities";
import { extractErrorMessage, extractErrorStatus } from "../utils";
import type BaseRecord from "../models/records";
import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

interface UseRecordPageProps<T> {
	recordId: string;
	queryHook: (id: number) => {
		data: T | undefined;
		isLoading: boolean;
		isError: boolean;
		isSuccess: boolean;
		error: SerializedError | FetchBaseQueryError | undefined;
	};
}

const useRecordPage = <T extends BaseRecord>({
	recordId,
	queryHook,
}: UseRecordPageProps<T>) => {
	const {
		data: recordData,
		isLoading,
		isError,
		isSuccess,
		error,
	} = queryHook(Number.parseInt(recordId));

	const renderView = (
		loadingMessage: string,
		renderContent: (data: T) => React.ReactNode,
	) => {
		if (isLoading) {
			return <LoadingStateView message={loadingMessage} />;
		}

		if (isError) {
			return (
				<ErrorStateView
					message={extractErrorMessage(error)}
					title={`Error ${extractErrorStatus(error)}`}
				/>
			);
		}

		if (isSuccess && recordData) {
			return renderContent(recordData);
		}

		return null;
	};

	return {
		recordData,
		isLoading,
		isError,
		isSuccess,
		error,
		renderView,
	};
};

export default useRecordPage;
