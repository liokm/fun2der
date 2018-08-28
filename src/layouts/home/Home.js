import React, { Component } from 'react'
import { AccountData, ContractData, ContractForm } from 'drizzle-react-components'
import logo from '../../logo.png'
import Button from '@material-ui/core/Button';
import { getContext, compose, withState, withHandlers, branch, renderComponent, withProps, lifecycle } from 'recompose';
import { CircularProgress } from '@material-ui/core';
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles';
import { delay } from 'redux-saga';
import Tooltip from '@material-ui/core/Tooltip';

/**
 * TODO
 * To write normal modulized structure and SPA w/ fancy UI...
 * IPFS
 * uport
 * create project
 * quick project
 * list projects
 * list my projects
 * project
 */


const styles = theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
  },
  wrapper: {
    margin: theme.spacing.unit,
    position: 'relative',
  },
  fabProgress: {
    position: 'absolute',
    top: -6,
    left: -6,
    zIndex: 1,
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
});

const LoadingComp = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <CircularProgress />
  </div>
);

const enhance = compose(
  withStyles(styles),
  getContext({
    drizzle: PropTypes.object
  }),
  withProps(({ drizzle: { web3, contracts : { Fun2der: Fun2derCtx }}, contracts: { Fun2der } }) => ({
    web3,
    Fun2derCtx,
    Fun2der
  })),
  branch(({ Fun2der }) => !Fun2der.initialized, renderComponent(LoadingComp))
);

const QuickProject = drizzleConnect(
  compose(
    enhance,
    withState('loading', 'setLoading', false),
    withHandlers({
      handleClick: ({ setLoading, Fun2derCtx }) => async () => {
        setLoading(true);
        try {
          // TODO 
          const stackId = await Fun2derCtx.methods.quickProject.cacheSend();
          await delay(1000);
        } catch (e) {
          console.log('quickProject failed', e);
        } finally {
          setLoading(false);
        }
      }
    })
  )(
    ({
      classes,
      loading,
      setLoading,
      handleClick = () => setLoading(true)
    }) => (
      <div className={classes.root}>
        <Tooltip title="Add a quick project for demo purpose">
          <div className={classes.wrapper}>
            <Button
              variant="outlined"
              color="primary"
              disabled={loading}
              onClick={handleClick}
            >
              add demo project
            </Button>
            {loading && (
              <CircularProgress size={24} className={classes.buttonProgress} />
            )}
          </div>
        </Tooltip>
      </div>
    )
  ),
  state => ({
    contracts: state.contracts
  })
);

const ProjectItem = drizzleConnect(
  compose(
    enhance,
    lifecycle({
      componentWillMount() {

      }
    }),
    withProps(({ idx, Fun2derCtx }) => ({
      // Should be address
      dataKey: Fun2derCtx.methods.getProject.cacheCall(idx)
    })),
    branch(
      ({ Fun2der, dataKey }) => !(dataKey in Fun2der.getProject),
      renderComponent(LoadingComp)
    )
  )(({ dataKey, Fun2der, idx, web3 }) => {
    const value = Fun2der.getProject[dataKey].value;
    return <p>{web3.utils.hexToUtf8(value._name)}</p>
  }),
  state => ({
    contracts: state.contracts
  })
);

// Load count then loop to get all data, note that the cached version is used 
const ProjectList = drizzleConnect(
  compose(
    enhance,
    withProps(({ Fun2derCtx }) => ({
      dataKey: Fun2derCtx.methods.getProjectCount.cacheCall()
    })),
    branch(
      ({ Fun2der, dataKey }) => !(dataKey in Fun2der.getProjectCount),
      renderComponent(LoadingComp)
    )
  )(({ classes, dataKey, Fun2der }) => {
    const value = Fun2der.getProjectCount[dataKey].value;
    return (
      <div>
        count: {value}
        {!!value > 0 && <ProjectItem idx={0} />}
      </div>
    );
  }),
  state => ({
    contracts: state.contracts
  })
);

class Home extends Component {
  render() {
    return <main className="container">
        <div className="pure-g">
          <div className="pure-u-1-1 header">
            {/* <img src={logo} alt="drizzle-logo" /> */}
            <h1>fun&sup2;der, Funder having Fun</h1>
          </div>

          <div className="pure-u-1-1">
            <h2>Active Account</h2>
            <AccountData accountIndex="0" units="ether" precision="3" />
          </div>

          {/* highlights */}
          {/* my projects */}
          {/* list of projects */}
          <div className="pure-u-1-1">
            <h2>Projects</h2>
            <ProjectList />
            <QuickProject />
            <p>
              <strong>Owner</strong>: <ContractData contract="Fun2der" method="owner" />
            </p>
          </div>

          {/* <div className="pure-u-1-1">
            <h2>My Projects</h2>
          </div>


          <div className="pure-u-1-1">
            <h2>SimpleStorage</h2>
            <p>
              This shows a simple ContractData component with no arguments,
              along with a form to set its value.
            </p>
            <p>
              <strong>Stored Value</strong>: <ContractData contract="SimpleStorage" method="storedData" />
            </p>
            <ContractForm contract="SimpleStorage" method="set" />

            <br />
            <br />
          </div>

          <div className="pure-u-1-1">
            <h2>TutorialToken</h2>
            <p>
              Here we have a form with custom, friendly labels. Also note the token symbol will not display a loading indicator. We've suppressed it with the <code
              >
                hideIndicator
              </code> prop because we know this variable is constant.
            </p>
            <p>
              <strong>Total Supply</strong>: <ContractData contract="TutorialToken" method="totalSupply" methodArgs={[{ from: this.props.accounts[0] }]} /> <ContractData contract="TutorialToken" method="symbol" hideIndicator />
            </p>
            <p>
              <strong>My Balance</strong>: <ContractData contract="TutorialToken" method="balanceOf" methodArgs={[this.props.accounts[0]]} />
            </p>
            <h3>Send Tokens</h3>
            <ContractForm contract="TutorialToken" method="transfer" labels={['To Address', 'Amount to Send']} />

            <br />
            <br />
          </div>

          <div className="pure-u-1-1">
            <h2>ComplexStorage</h2>
            <p>
              Finally this contract shows data types with additional
              considerations. Note in the code the strings below are
              converted from bytes to UTF-8 strings and the device data
              struct is iterated as a list.
            </p>
            <p>
              <strong>String 1</strong>: <ContractData contract="ComplexStorage" method="string1" toUtf8 />
            </p>
            <p>
              <strong>String 2</strong>: <ContractData contract="ComplexStorage" method="string2" toUtf8 />
            </p>
            <strong>Single Device Data</strong>: <ContractData contract="ComplexStorage" method="singleDD" />
            <br />
            <br />
          </div> */}
        </div>
      </main>;
  }
}

export default Home
