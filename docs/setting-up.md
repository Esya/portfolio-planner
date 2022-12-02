```shell
# 1- Extract
docker run -t -v "${PWD}/openstreetmap-data:/data" osrm/osrm-backend osrm-extract -p /opt/car.lua /data/malaysia-singapore-brunei-latest.osm.pbf

# 2- Partition
docker run -t -v "${PWD}/openstreetmap-data:/data" osrm/osrm-backend osrm-partition /data/malaysia-singapore-brunei-latest.osrm

# 3- Customize
docker run -t -v "${PWD}/openstreetmap-data:/data" osrm/osrm-backend osrm-customize /data/malaysia-singapore-brunei-latest.osrm

# 4- Launch
docker run -t -i -p 5000:5000 -v "${PWD}/openstreetmap-data:/data" osrm/osrm-backend osrm-routed --algorithm mld --max-table-size 10000 /data/malaysia-singapore-brunei-latest.osrm

# Install rust
# Install cargo
cargo install vrp-cli

```
