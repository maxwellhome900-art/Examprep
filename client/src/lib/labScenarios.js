export function getLabWelcome(scenarioId) {
  if (scenarioId === "networking") {
    return {
      title: "Networking lab — SOHO router / switch",
      banner: [
        "Scenario: You are configuring a small office LAN. The gateway is 192.168.1.1/24.",
        "Type `help` for commands. Type `exit` to leave the simulation.",
      ],
    };
  }
  if (scenarioId === "linux") {
    return {
      title: "Linux lab — junior admin tasks",
      banner: [
        "Scenario: Shared training host. You have sudo for package and user tasks.",
        "Type `help` for commands. Type `exit` to leave the simulation.",
      ],
    };
  }
  return {
    title: "Unknown lab",
    banner: ["No scenario loaded. Use the Labs page to start a session."],
  };
}

export function runLabCommand(scenarioId, line) {
  const cmd = line.trim().toLowerCase();
  if (!cmd) return "";

  if (scenarioId === "networking") {
    return runNetworking(cmd);
  }
  if (scenarioId === "linux") {
    return runLinux(cmd);
  }
  return `lab: unknown scenario "${scenarioId}"`;
}

function runNetworking(cmd) {
  if (cmd === "help") {
    return [
      "Available commands (simulated):",
      "  ip address      — show interface summary",
      "  ip route        — show IPv4 default route",
      "  ping 8.8.8.8    — simple connectivity check",
      "  traceroute 8.8.8.8 — three-hop mock trace",
      "  show mac        — mock switch MAC table",
      "  clear           — clear screen note",
      "  exit            — return to hub",
    ].join("\n");
  }
  if (cmd === "exit") return "__EXIT__";
  if (cmd === "clear") return "__CLEAR__";

  if (cmd === "ip address" || cmd === "ip addr") {
    return [
      "1: lo: <LOOPBACK,UP> mtu 65536",
      "    inet 127.0.0.1/8 scope host lo",
      "2: eth0: <BROADCAST,MULTICAST,UP> mtu 1500",
      "    inet 192.168.1.50/24 brd 192.168.1.255 scope global eth0",
    ].join("\n");
  }
  if (cmd === "ip route" || cmd === "route -n") {
    return [
      "default via 192.168.1.1 dev eth0 proto static metric 100",
      "192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.50",
    ].join("\n");
  }
  if (cmd === "ping 8.8.8.8" || cmd.startsWith("ping ")) {
    return [
      "PING 8.8.8.8 (8.8.8.8): 56 data bytes",
      "64 bytes from 8.8.8.8: icmp_seq=0 ttl=118 time=12.4 ms",
      "64 bytes from 8.8.8.8: icmp_seq=1 ttl=118 time=11.9 ms",
      "--- 8.8.8.8 ping statistics ---",
      "2 packets transmitted, 2 received, 0% packet loss",
    ].join("\n");
  }
  if (cmd.startsWith("traceroute ")) {
    return [
      "traceroute to 8.8.8.8 (8.8.8.8), 30 hops max",
      " 1  192.168.1.1 (192.168.1.1)  1.102 ms",
      " 2  10.5.2.1 (10.5.2.1)  7.334 ms",
      " 3  8.8.8.8 (8.8.8.8)  11.221 ms",
    ].join("\n");
  }
  if (cmd === "show mac") {
    return [
      "MAC Address Table (VLAN 1)",
      " port    mac address        type",
      " Gi0/1   a1:b2:c3:d4:e5:f6   dynamic",
      " Gi0/4   00:11:22:33:44:55   dynamic",
    ].join("\n");
  }

  return `bash: ${cmd}: command not found (type \`help\`)`;
}

function runLinux(cmd) {
  if (cmd === "help") {
    return [
      "Available commands (simulated):",
      "  pwd, ls -la, whoami",
      "  cat /etc/os-release",
      "  ss -tlnp         — listening TCP sockets",
      "  journalctl -k -n 5 — last kernel lines",
      "  clear, exit",
    ].join("\n");
  }
  if (cmd === "exit") return "__EXIT__";
  if (cmd === "clear") return "__CLEAR__";

  if (cmd === "pwd") return "/home/student/lab02";
  if (cmd === "whoami") return "student";
  if (cmd === "ls" || cmd === "ls -la") {
    return [
      "total 24",
      "drwxr-xr-x 3 student student 4096 May  5 10:02 .",
      "drwxr-xr-x 5 student student 4096 May  5 09:58 ..",
      "-rw-r--r-- 1 student student  220 May  5 09:58 notes.txt",
      "drwxr-xr-x 2 student student 4096 May  5 10:00 scripts",
    ].join("\n");
  }
  if (cmd === "cat /etc/os-release") {
    return [
      'NAME="CertPrep Labs"',
      "VERSION=\"24.04 LTS\"",
      'ID=ubuntu',
      "PRETTY_NAME=\"CertPrep Labs 24.04 LTS\"",
    ].join("\n");
  }
  if (cmd === "ss -tlnp") {
    return [
      "State  Recv-Q Send-Q Local Address:Port Peer Address:PortProcess",
      "LISTEN 0      128    127.0.0.1:631     0.0.0.0:*",
      "LISTEN 0      128    0.0.0.0:22        0.0.0.0:* users:((\"sshd\",pid=812,fd=3))",
    ].join("\n");
  }
  if (cmd === "journalctl -k -n 5" || cmd.startsWith("journalctl")) {
    return [
      "kernel: igb 0000:00:1f.6 eth0: NIC Link is Up 1000 Mbps Full Duplex",
      "kernel: audit: type=1400 audit(1714912320.123:42): apparmor=\"STATUS\"",
      "kernel: systemd[1]: Reached target Network.",
    ].join("\n");
  }

  return `bash: ${cmd}: command not found (type \`help\`)`;
}
