// (C) 2022 GoodData Corporation
import React from "react";
import { ErrorComponent, LoadingComponent } from "@gooddata/sdk-ui";
import {
    CustomDashboardInsightComponent,
    selectLocale,
    useDashboardSelector,
} from "@gooddata/sdk-ui-dashboard";
import { useInsightWidgetDataView } from "./utils/useInsightWidgetDataView";
import { getGaugeValues } from "./utils/gaugeUtils";
import GaugeChart from "react-gauge-chart";

export const GaugeAdapter: CustomDashboardInsightComponent = ({
    ErrorComponent: CustomError,
    LoadingComponent: CustomLoading,
    widget,
    insight,
}) => {
    // get the current user's locale to format the numbers properly
    const locale = useDashboardSelector(selectLocale);

    const GaugeError = CustomError ?? ErrorComponent;
    const GaugeLoading = CustomLoading ?? LoadingComponent;

    // load the data for the insight
    const { result, error, status } = useInsightWidgetDataView({
        insightWidget: widget,
    });

    if (status === "loading" || status === "pending") {
        return <GaugeLoading />;
    }

    if (status === "error") {
        return <GaugeError message={error?.message ?? "Unknown error"} />;
    }

    // once the data is loaded, convert it to values the Gauge visualization can understand
    const { gaugeResult, gaugeError } = getGaugeValues(result!, insight);

    if (gaugeError || !gaugeResult) {
        return <GaugeError message={gaugeError?.message ?? "Unknown error"} />;
    }

    return (
        <Gauge
            max={gaugeResult.max}
            value={gaugeResult.value}
            format="%"
            locale={locale}
        />
    );
};

export const Gauge: React.FC<{
    max: number;
    value: number;
    format?: "%" | "#";
    showLabels?: boolean;
    locale?: string;
}> = ({ max, value, format = "#", showLabels = false, locale = "en-US" }) => {
    const percent = value / max;

    return (
        <div style={{ padding: "1rem" }}>
            <GaugeChart
                animate={false}
                nrOfLevels={20}
                percent={percent}
                textColor="black"
                formatTextValue={() =>
                    format === "#"
                        ? new Intl.NumberFormat(locale).format(value)
                        : new Intl.NumberFormat(locale, {
                              style: "percent",
                          }).format(percent)
                }
            />
            {showLabels && (
                <svg viewBox="0 0 250 25">
                    <text x="15%" y="20">
                        {format === "#" ? "0" : "0%"}
                    </text>
                    <text x="75%" y="20">
                        {format === "#" ? max : "100%"}
                    </text>
                </svg>
            )}
        </div>
    );
};