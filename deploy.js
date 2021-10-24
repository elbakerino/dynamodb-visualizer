const fs = require('fs')
const path = require('path')
const rimraf = require('rimraf')
const {
    // simple reusable app deployment config:
    deployApp,
    // reusable deployment tasks:
    authDeployer, apiDeploy,
    // a CLI handler:
    runDeploy,
    // executes CLI handler with minimist:
    runCLI,
} = require('deployer-buddy')
const {packIntoTmp} = require('cloud-buddy')

const rootDir = __dirname
const tmpDir = path.resolve(__dirname, 'tmp')

const actionTargets = {
    'dynamodb-visualizer': deployApp(
        'dynamodb-visualizer', 'php',
        () => packIntoTmp(path.join(rootDir, 'build'), tmpDir), [
            'host_id=clients-shared',
        ],
    ),
}

const prepareDeployment = async (deployment) => {
    const {config: {rootDir, isProd}} = deployment
    // CI config generation from env variables
    try {
        fs.mkdirSync(tmpDir, {recursive: true})
    } catch(e) {
        console.log('Couldn\'t write tmp dir ' + tmpDir, e)
        process.exit(1)
    }
    try {
    } catch(e) {
        // not fetching `e`, as may have secret values
        // console.log(e)
        throw new Error('couldn\'t write the config files!')
    }

    return {
        ...deployment,
        config: {
            DEPLOYER_HOST: process.env.DEPLOYER_HOST,
            DEPLOYER_PORT: 3030,
            ...deployment.config,
        },
    }
}

const deployments = [
    prepareDeployment,
    authDeployer,
    // the actual `apps deploy` actions >>>
    ...actionTargets['dynamodb-visualizer'].deploy,
    // <<< the actual `apps deploy` actions
    apiDeploy(['verbose=1']),
]

const handler = {
    deployDocs: async () => {
        console.log('Deploy Command, for CI usage! Triggers the specified build options and pushes the artifact to the configured "manage" target')
        console.log('uses a lot of special env variables, injected by CI')
        console.log('node _ci deploy')
    },
    deploy: async () => {
        const GIT_BRANCH = process.env.GIT_BRANCH

        const AUTH0_ID = process.env.AUTH0_ID
        const AUTH0_SECRET = process.env.AUTH0_SECRET
        // the AUTH0 app audience, 1:1 like in admin
        const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE
        // the AUTH0 base endpoint, without trailing backslash
        const AUTH0_ISSUER = process.env.AUTH0_ISSUER

        if(!GIT_BRANCH) {
            return Promise.reject('GIT_BRANCH must be set!')
        }
        if(!AUTH0_ID) {
            return Promise.reject('AUTH0_ID must be set!')
        }
        if(!AUTH0_SECRET) {
            return Promise.reject('AUTH0_SECRET must be set!')
        }
        if(!AUTH0_AUDIENCE) {
            return Promise.reject('AUTH0_AUDIENCE must be set!')
        }
        if(!AUTH0_ISSUER) {
            return Promise.reject('AUTH0_ISSUER must be set!')
        }
        const isProd = GIT_BRANCH === 'main'

        return await runDeploy(
            deployments,
            {
                rootDir, rootDirs: {},
                envConfig: {
                    GIT_BRANCH,
                    NODE_ENV: isProd ? 'production' : 'development',
                    APP_ENV: isProd ? 'prod' : 'dev',
                    AUTH0_ID,
                    AUTH0_SECRET,
                    AUTH0_AUDIENCE,
                    AUTH0_ISSUER,
                },
            },
        )
    },
}

runCLI(actionTargets, handler)
