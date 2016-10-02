
src_dir=$1

if [[ -z "$src_dir" ]]; then
  echo "Required arguments: <source dir>"
  exit 1
fi

mkdir -p html
mkdir -p js

pug "$src_dir"/pug/pages --out html

pug "$src_dir"/pug/scripts --client --no-debug --name-after-file --out js

cp -r "$src_dir"/js/* js
