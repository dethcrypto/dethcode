exports.argv = {
  production:
    process.env.NODE_ENV === "production" || saysTrue(readArg("production")),
  verbose: saysTrue(readArg("verbose")),
  force: saysTrue(readArg("force")),
};

function saysTrue(value) {
  if (typeof value === "string") value = value.toLowerCase();

  return [1, true, "1", "true", "yes"].includes(value);
}

/**
 * @param {string} name
 */
function readArg(name) {
  if (process.argv.includes(`--${name}`)) return true;

  const argWithValuePrefix = `--${name}=`;
  const withValue = process.argv.find((arg) =>
    arg.startsWith(argWithValuePrefix)
  );

  if (withValue) {
    return withValue.replace(argWithValuePrefix, "");
  }

  const fromEnv = process.env[name.toUpperCase()];
  if (fromEnv) return fromEnv;

  return false;
}
