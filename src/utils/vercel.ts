import axios from 'axios';

import logger from '@/utils/logger';

export class Vercel {
  private vercelToken: string;

  private vercelProjectId: string;

  public constructor(option?: {
    vercelToken: string;
    vercelProjectId: string;
  }) {
    if (option) {
      this.vercelProjectId = option.vercelProjectId;
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
    const find1 = configs.find((o) => o.key === 'VERCEL_PROJECT_ID');
    const find2 = configs.find((o) => o.key === 'VERCEL_TOKEN');
    if (find1 && find2) {
      this.vercelProjectId = find1.value;
      this.vercelToken = find2.value;
    }
    const data = JSON.stringify(configs);
    const config = {
      method: 'post',
      url: `https://api.vercel.com/v8/projects/${this.vercelProjectId}/env`,
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
      projectId: this.vercelProjectId,
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
    const deployment = await this.getDeployments();
    const gitMeta = deployment.data.deployments[0].meta;
    const data = JSON.stringify({
      name: '',
      project: this.vercelProjectId,
      target: 'production',
      gitSource: {
        type: 'github',
        repo: gitMeta.githubRepo,
        ref: 'main',
        repoId: gitMeta.githubRepoId,
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
      url: `https://api.vercel.com/v8/projects/${this.vercelProjectId}/env?decrypt=true`,
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
