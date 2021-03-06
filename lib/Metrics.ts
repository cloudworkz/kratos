import * as promClient from "prom-client";
const promDefaultMetrics = promClient.collectDefaultMetrics;
const promRegistry = promClient.Registry;

const UNDERSCORE_REGEX = /-/g;

export class Metrics {

  private prefix: string;
  private defaultCounterLabels: string[];
  private defaultGaugeLabels: string[];
  private register: promClient.Registry;
  private defaultMetricsIntv!: number | NodeJS.Timer;
  private metrics: {
    [key: string]: promClient.Counter | promClient.Gauge;
  };

  constructor(prefix: string = "", defaultCounterLabels: string[] = [], defaultGaugeLabels: string[] = []) {
    this.prefix = this.cleanMetricName(prefix);
    this.defaultCounterLabels = defaultCounterLabels;
    this.defaultGaugeLabels = defaultGaugeLabels;
    this.register = new promRegistry();
    this.metrics = {};
  }

  public exportType() {
    return this.register.contentType;
  }

  public exportMetrics() {
    return this.register.metrics();
  }

  public getRegister() {
    return this.register;
  }

  private cleanMetricName(name: string): string {
    return name.replace(UNDERSCORE_REGEX, "_");
  }

  private cleanLabels(labels: { [labelName: string]: string }): { [labelName: string]: string } {

    Object.keys(labels).forEach((labelName) => {
      labels[labelName] = this.cleanMetricName(labels[labelName]);
    });

    return labels;
  }

  private getCounter(key: string): promClient.Counter {

    if (this.metrics[key]) {
      return this.metrics[key];
    }

    this.metrics[key] = new promClient.Counter({
      name: `${key}`,
      help: `${key}_help`,
      registers: [this.register],
      labelNames: [...[], ...this.defaultCounterLabels],
    });

    return this.metrics[key];
  }

  private getGauge(key: string): promClient.Gauge {

    // prefix
    key = `${key}_gauge`;

    if (this.metrics[key]) {
      return this.metrics[key] as promClient.Gauge;
    }

    this.metrics[key] = new promClient.Gauge({
      name: `${key}`,
      help: `${key}_help`,
      registers: [this.register],
      labelNames: [...[], ...this.defaultGaugeLabels],
    });

    return this.metrics[key] as promClient.Gauge;
  }

  public inc(key: string, val: number = 1, labels: { [labelName: string]: string } = {}) {

    key = this.cleanMetricName(key);
    const prefix = this.prefix;
    const fullKey = prefix ? `${prefix}_${key}` : key;

    try {
      const counter = this.getCounter(fullKey);
      counter.inc(
        this.cleanLabels(labels),
        val,
        Date.now(),
      );
    } catch (error) {
      // empty
    }
  }

  public set(key: string, val: number, labels: { [labelName: string]: string } = {}) {

    if (val === null || val === undefined) {
      throw new Error(`Please provide value on set ${key}`);
    }

    key = this.cleanMetricName(key);
    const prefix = this.prefix;
    const fullKey = prefix ? `${prefix}_${key}` : key;

    try {
      const gauge = this.getGauge(fullKey);
      gauge.set(
        this.cleanLabels(labels),
        val,
        Date.now(),
      );
    } catch (error) {
      // empty
    }
  }

  public registerDefault() {
    this.defaultMetricsIntv = promDefaultMetrics({
      register: this.register,
      timeout: 5000,
    });
  }

  public close() {

    if (this.defaultMetricsIntv) {
      clearInterval(this.defaultMetricsIntv as NodeJS.Timer);
    }

    this.metrics = {};
    this.register.clear();
  }
}
