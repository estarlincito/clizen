PR = pnpm run

m:
	lineo md 'src/**/*.ts' --outFile code.md --outDir temp	
r:
	$(PR) release
t:
	$(PR) check-types
l:
	$(PR) lint
c:
	$(PR) clean
b:
	$(PR) build
d:
	$(PR) dev
