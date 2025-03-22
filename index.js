#!/usr/bin/env node
const spawn = require("child_process").spawn;
const process = require("process");
const fs = require("fs");
const args = process.argv;
const repository = "https://github.com/qidasheng369/react-app-template.git";
const newDir =
  args[2] === undefined ? "./my-react-app-template" : `./${args[2]}`;

const clone = (repo, targetPath, opts, cb) => {
  if (typeof opts === "function") {
    cb = opts;
    opts = null;
  }

  opts = opts || {};

  const git = opts.git || "git";
  const gitArgs = ["clone"];

  if (opts.shallow) {
    gitArgs.push("--depth");
    gitArgs.push("1");
  }

  gitArgs.push("--");
  gitArgs.push(repo);
  gitArgs.push(targetPath);

  const process = spawn(git, gitArgs);

  process.on("close", function (status) {
    if (status == 0) {
      if (opts.checkout) {
        gitCheckout();
      } else {
        cb && cb();
      }
    } else {
      cb && cb(new Error("'git clone' failed with status " + status));
    }
  });

  const gitCheckout = () => {
    const args = ["checkout", opts.checkout];
    const process = spawn(git, args, { cwd: targetPath });
    process.on("close", function (status) {
      if (status == 0) {
        cb && cb();
      } else {
        cb && cb(new Error("'git checkout' failed with status " + status));
      }
    });
  };
};

const createReactTemplateFolder = () => {
  return fs.mkdir(newDir, { recursive: true }, (err) => {
    if (err) throw err;
  });
};

const updatePackageJson = () => {
  const packageJsonPath = `${newDir}/package.json`;
  fs.readFile(packageJsonPath, 'utf8', (err, data) => {
    if (err) {
      console.log('Error reading package.json:', err);
      return;
    }

    try {
      const packageJson = JSON.parse(data);
      // 使用目录名作为项目名称，移除开头的 './' 并替换非法字符
      const projectName = newDir.replace(/^\.\//, '').replace(/[^a-zA-Z0-9-]/g, '-');
      packageJson.name = projectName;

      fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8', (err) => {
        if (err) {
          console.log('Error writing package.json:', err);
          return;
        }
        console.log('Successfully updated package.json name to:', projectName);
      });
    } catch (err) {
      console.log('Error parsing package.json:', err);
    }
  });
};

const copyTemplateToFolder = () => {
  createReactTemplateFolder();
  clone(repository, newDir, [], (err) => {
    if (err) {
      console.log("Error cloning repository:", err);
      return;
    }
    updatePackageJson();
    console.log("Success! Your React template is ready.");
  });
};

copyTemplateToFolder();
