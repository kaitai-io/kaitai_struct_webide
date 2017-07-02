import * as $ from "jquery";
import {downloadFile} from "../utils";

export namespace Entities {
    export interface IRepository {
        id: number;
        name: string;
        full_name: string;
        owner: {
          login: string;
        };
        private: boolean;
        permissions: {
            admin: boolean;
            push: boolean;
            pull: boolean;
        };
    }

    export interface IContent {
        name: string;
        path: string;
        sha: string;
        size: number;
        url: string;
        html_url: string;
        git_url: string;
        download_url: string;
        /* tslint:disable */
        type: "file" | "dir" | "symlink" | "submodule";
        /* tslint:enable */
    }
}

export class Repository {
    public entity: Entities.IRepository;

    constructor(public client: GithubClient, public name: string, public owner?: string) {
        var nameParts = name.split("/");
        if (nameParts.length === 2) {
            this.owner = nameParts[0];
            this.name = nameParts[1];
        }
    }

    static fromEntity(client: GithubClient, entity: Entities.IRepository) {
        var repo = new Repository(client, entity.full_name);
        repo.entity = entity;
        return repo;
    }

    getContents(path: string = "/") {
        return this.client.req<Entities.IContent[]>(`/repos/${this.owner}/${this.name}/contents${path}`);
    }

    downloadFile(path: string) {
        return downloadFile(`https://raw.githubusercontent.com/koczkatamas/kaitai_struct_formats/master${path}`);
    }
}

export class GithubClient {
    constructor(public accessToken: string, public owner?: string) { }

    req<T>(path: string): Promise<T> {
        return new Promise((resolve, reject) => $.getJSON(`https://api.github.com${path}?access_token=${this.accessToken}`)
            .then(json => resolve(<T>json), xhr => {
                var errorMessage = xhr.responseJSON && xhr.responseJSON.message;
                console.log("github reject", errorMessage, xhr);
                reject(errorMessage || xhr.statusText);
            }));
    }

    async listRepos(): Promise<Repository[]> {
        let repos = await this.req<Entities.IRepository[]>("/user/repos");
        return repos.map(entity => Repository.fromEntity(this, entity));
    }

    getRepo(name: string, owner?: string): Repository {
        return new Repository(this, name, owner || this.owner);
    }
}
