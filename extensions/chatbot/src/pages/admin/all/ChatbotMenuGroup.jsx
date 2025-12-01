import { NavigationItemGroup } from "@components/admin/cms/NavigationItemGroup";
import ChatAltIcon from "@heroicons/react/solid/esm/ChatAlt2Icon";
import CogIcon from "@heroicons/react/solid/esm/CogIcon";
import PropTypes from "prop-types";
import React from "react";

export default function ChatbotMenuGroup({ chatbotDashboard, chatbotSettings, adminChat }) {
  return (
    <NavigationItemGroup
      id="chatbotMenuGroup"
      name="Chatbot"
      items={[
        {
          Icon: ChatAltIcon,
          url: adminChat,
          title: "Admin Chat",
        },
        {
          Icon: ChatAltIcon,
          url: chatbotDashboard,
          title: "Dashboard",
        },
        {
          Icon: CogIcon,
          url: chatbotSettings,
          title: "Settings",
        },
      ]}
    />
  );
}

ChatbotMenuGroup.propTypes = {
  chatbotDashboard: PropTypes.string.isRequired,
  chatbotSettings: PropTypes.string.isRequired,
  adminChat: PropTypes.string.isRequired,
};

export const layout = {
  areaId: "adminMenu",
  sortOrder: 50,
};

export const query = `
  query Query {
    adminChat: url(routeId:"adminChat")
    chatbotDashboard: url(routeId:"chatbotDashboard")
    chatbotSettings: url(routeId:"chatbotSettings")
  }
`;

