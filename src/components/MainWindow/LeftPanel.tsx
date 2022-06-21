import useRoute, { Route } from "components/useRoute";
import { FunctionComponent, useMemo } from "react";
import LeftPanelItem from "./LeftPanelItem";
import './LeftPanel.css'
import { AccountTree, Home, ViewModule, Storage, HelpOutline } from "@material-ui/icons";

type Props = {
    width: number
    height: number
}

const LeftPanel: FunctionComponent<Props> = ({width, height}) => {
    const {route, setRoute} = useRoute()

    const items: {
        label: string
        route: Route
        icon?: any
    }[] = useMemo(() => ([
        {label: 'Home', route: {page: 'home'}, icon: <Home />},
        {label: 'Projects', route: {page: 'projects'}, icon: <AccountTree />},
        {label: 'Clients', route: {page: 'clients'}, icon: <ViewModule />},
        {label: 'Buckets', route: {page: 'buckets'}, icon: <Storage />}
    ]), [])

    return (
        <div className="LeftPanel" style={{position: 'absolute', width, height}}>
            {
                items.map(item => (
                    <LeftPanelItem
                        key={item.label}
                        label={item.label}
                        icon={item.icon}
                        onClick={() => {setRoute(item.route)}}
                        selected={JSON.stringify(item.route) === JSON.stringify(route)}
                    />
                ))
            }
            <hr />
            <p />
            <LeftPanelItem
                key="documentation"
                label="Documentation"
                icon={<HelpOutline />}
                onClick={() => {(window as any).location="https://github.com/scratchrealm/kachery-cloud"}}
                selected={false}
            />
        </div>
    )
}

export default LeftPanel