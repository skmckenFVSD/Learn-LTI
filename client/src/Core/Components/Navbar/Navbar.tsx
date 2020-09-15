import React, { MouseEvent } from 'react';
import { Nav, INavLinkGroup, INavLink, INavStyles } from 'office-ui-fabric-react/lib/Nav';
import { useObserver } from 'mobx-react-lite';
import { useHistory, useLocation } from 'react-router-dom';
import _ from 'lodash';
import { configurationRoutes, viewRoutes } from '../../../Router/RoutesConfiguration';
import { useStore } from '../../../Stores/Core';
import { NavbarSectionHeader } from './NavbarSectionHeader';
import { styled, FontWeights } from '@fluentui/react';
import { IThemeOnlyProps, IStylesOnly } from '../../Utils/FluentUI/typings.fluent-ui';
import { Assignment } from '../../../Models/Assignment.model';
import { FilterType } from '../../../Models/Learn/FilterType.model';

const getNavLinkGroups = (assignment: Assignment): INavLinkGroup[] => [
  {
    name: 'Configuration',
    links:
      assignment.publishStatus === 'Published'
        ? configurationRoutes.map(route => ({ ...route, disabled: true }))
        : configurationRoutes
  },
  {
    name: 'View',
    links: viewRoutes
  }
];

const removeSlashFromStringEnd = (initialString: string): string => initialString.replace(/\/$/, '');

const NavbarInner = ({ styles }: IStylesOnly<INavStyles>): JSX.Element | null => {
  const assignmentStore = useStore('assignmentStore');
  const learnStore = useStore('microsoftLearnStore');
  const history = useHistory();
  const location = useLocation();

  const getMappedLinkGroups = (assignment: Assignment): INavLinkGroup[] =>
    _.map(getNavLinkGroups(assignment), group => ({
      ...group,
      links: _.map(group.links, link => {
        const assignmentId = assignment?.id;
        const url = assignmentId ? `/${assignmentId}${link.url}` : '/';
        return {
          ...link,
          url: url,
          key: url,
          title: ''
        };
      })
    }));

  const handleLinkClick = (event?: MouseEvent, item?: INavLink): void => {
    event?.preventDefault();
    if(item && item.url?.indexOf('ms-learn')>0){
      history.push({
        pathname: item.url,
        search: '?'+learnStore.filter.learnFilterUriParam
      })
    }
    else if (item) {
      history.push(item.url);
    }
  };

  const selectedNavKey = removeSlashFromStringEnd(location.pathname);

  return useObserver(() => {
    if (!assignmentStore.assignment) {
      return null;
    }
    return (
      <Nav
        initialSelectedKey={getMappedLinkGroups(assignmentStore.assignment)[0].links[0].key}
        selectedKey={selectedNavKey}
        onLinkClick={handleLinkClick}
        groups={getMappedLinkGroups(assignmentStore.assignment)}
        styles={styles}
        onRenderGroupHeader={(group): JSX.Element => <NavbarSectionHeader name={group?.name || ''} />}
      />
    );
  });
};

const navStyles = ({ theme }: IThemeOnlyProps): Partial<INavStyles> => ({
  root: {
    width: `calc(${theme.spacing.l1} * 11)`,
    backgroundColor: theme.palette.neutralLighter,
    height: '100%',
    paddingTop: theme.spacing.l2,
    borderRight: `1px solid ${theme.palette.neutralQuaternaryAlt}`,
    boxSizing: 'border-box'
  },
  linkText: {
    paddingLeft: theme.spacing.m,
    margin: 0
  },
  navItem: {
    marginTop: theme.spacing.s2
  },
  groupContent: {
    marginBottom: theme.spacing.s1
  },
  link: {
    height: 36,
    paddingLeft: `calc(${theme.spacing.m} * 3)`,
    paddingRight: theme.spacing.m,
    selectors: {
      '.ms-Nav-compositeLink:hover:not(.is-disabled) &': {
        backgroundColor: theme.palette.neutralQuaternaryAlt,
        color: theme.palette.neutralDark,
        fontWeight: FontWeights.semibold,
        selectors: {
          '.ms-Icon': {
            color: theme.palette.neutralDark
          }
        }
      },
      '.ms-Nav-compositeLink.is-disabled &': {
        selectors: {
          '.ms-Icon': {
            color: theme.semanticColors.disabledText
          }
        }
      },
      '.ms-Nav-compositeLink.is-selected &': {
        backgroundColor: theme.palette.neutralLighterAlt
      },
      '.ms-Icon': {
        color: theme.palette.black,
        marginRight: 0
      },
      '::after': {
        boxSizing: 'border-box',
        backgroundColor: theme.palette.themeSecondary,
        border: 0,
        top: 5,
        bottom: 5,
        width: 4,
        left: 4,
        borderRadius: '4px / 8px'
      }
    }
  }
});

export const Navbar = styled(NavbarInner, navStyles);
