import { AppBar, Box, Tab, Tabs, Typography } from "@material-ui/core";
import React, { FunctionComponent, useCallback } from "react";
import BucketsTable from './BucketsTable';
import ClientsTable from './ClientsTable';
import ProjectsTable from './ProjectsTable';

type Props = {

}

function a11yProps(index: number) {
    return {
        id: `scrollable-auto-tab-${index}`,
        "aria-controls": `scrollable-auto-tabpanel-${index}`
    }
}

function TabPanel(props: any) {
    const { children, value, index, ...other } = props;

    return (
        <Typography
            component="div"
            role="tabpanel"
            hidden={value !== index}
            id={`scrollable-auto-tabpanel-${index}`}
            aria-labelledby={`scrollable-auto-tab-${index}`}
            {...other}
        >
            <Box p={3}>{children}</Box>
        </Typography>
    );
}

const TabWindow: FunctionComponent<Props> = () => {
    const [tabValue, setTabValue] = React.useState(0)
    const handleTabChange = useCallback((event, newValue) => {
        setTabValue(newValue)
    }, [])
    return (
        <AppBar position="static" color="default">
            <Tabs
                value={tabValue}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="scrollable"
                scrollButtons="auto"
                aria-label="scrollable auto tabs example"
            >
                <Tab label="Projects" {...a11yProps(0)} />
                <Tab label="Buckets" {...a11yProps(1)} />
                <Tab label="Clients" {...a11yProps(2)} />
            </Tabs>
            <TabPanel value={tabValue} index={0}>
                <ProjectsTable />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <BucketsTable />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
                <ClientsTable />
            </TabPanel>
        </AppBar>
    )
}

export default TabWindow