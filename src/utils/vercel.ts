import axios from 'axios';

import logger from '@/utils/logger';

export class Vercel {
  private vercelToken: string;

  private vercelProjectName: string;

  public constructor(option?: {
    vercelToken: string;
    vercelProjectName: string;
  }) {
    if (option) {
      this.vercelProjectName = option.vercelProjectName;
      this.vercelToken = option.vercelToken;
    }
  }

  public async setEnvironments(
    configs: {
      key: string;
      value: string;
      target: ('production' | 'preview' | 'development')[];
      type: 'encrypted';
    }[]
  ) {
    const find1 = configs.find((o) => o.key === 'DAO_PROJECT_NAME');
    const find2 = configs.find((o) => o.key === 'DAO_TOKEN');
    if (find1 && find2) {
      this.vercelProjectName = find1.value;
      this.vercelToken = find2.value;
    }
    const data = JSON.stringify(configs);
    const config = {
      method: 'post',
      url: `https://api.vercel.com/v8/projects/${this.vercelProjectName}/env`,
      headers: {
        Authorization: `Bearer ${this.vercelToken}`,
        'Content-Type': 'application/json',
      },
      data,
    };
    await axios(config);
    await this.redeploy();
    return true;
  }

  public async getDeployments() {
    const config = {
      method: 'get',
      url: 'https://api.vercel.com/v6/deployments',
      headers: {
        Authorization: `Bearer ${this.vercelToken}`,
        'Content-Type': 'application/json',
      },
    };
    return axios(config);
  }

  public getAliasOfAProject() {
    const data = JSON.stringify({
      projectId: this.vercelProjectName,
    });
    const config = {
      method: 'get',
      url: 'https://api.vercel.com/v4/aliases',
      headers: {
        Authorization: `Bearer ${this.vercelToken}`,
        'Content-Type': 'application/json',
      },
      data,
    };
    return axios(config);
  }

  public async redeploy() {
    const data = JSON.stringify({
      name: '',
      project: this.vercelProjectName,
      target: 'production',
      gitSource: {
        type: process.env.VERCEL_GIT_PROVIDER,
        repo: process.env.VERCEL_GIT_REPO_SLUG,
        ref: process.env.VERCEL_GIT_COMMIT_REF,
        repoId: process.env.VERCEL_GIT_REPO_ID,
      },
    });
    const config = {
      method: 'post',
      url: 'https://api.vercel.com/v13/deployments',
      headers: {
        Authorization: `Bearer ${this.vercelToken}`,
        'Content-Type': 'application/json',
      },
      data,
    };
    await axios(config);
  }

  public async getEnvironments() {
    const config = {
      method: 'get',
      url: `https://api.vercel.com/v8/projects/${this.vercelProjectName}/env?decrypt=true`,
      headers: {
        Authorization: `Bearer ${this.vercelToken}`,
        'Content-Type': 'application/json',
      },
      data: '',
    };
    try {
      const response = await axios(config);
      let result = '';
      response.data.envs.forEach((element: { key: string; value: string }) => {
        result += `${element.key}=${element.value}\n`;
      });
      logger.info('从 vercel 取回配置');
      return result;
    } catch (e) {
      logger.error(e);
    }
    return null;
  }
}
