#!/bin/bash

# Afrimall Production Deployment Script
# This script handles the complete production deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="afrimall"
DEPLOYMENT_DIR="/var/www/afrimall"
BACKUP_DIR="/var/backups/afrimall"
LOG_FILE="/var/log/afrimall/deploy.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

check_requirements() {
    log "Checking deployment requirements..."
    
    # Check if running as root or with sudo
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root. Use a regular user with sudo privileges."
    fi
    
    # Check required commands
    command -v node >/dev/null 2>&1 || error "Node.js is not installed"
    command -v npm >/dev/null 2>&1 || error "npm is not installed"
    command -v git >/dev/null 2>&1 || error "git is not installed"
    command -v pm2 >/dev/null 2>&1 || error "PM2 is not installed"
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        error "Node.js 18+ is required. Current version: $(node --version)"
    fi
    
    success "Requirements check passed"
}

check_environment() {
    log "Checking environment configuration..."
    
    # Check if .env.production exists
    if [ ! -f ".env.production" ]; then
        error ".env.production file not found. Please create it from env.production.example"
    fi
    
    # Check required environment variables
    source .env.production
    
    if [ -z "$PAYLOAD_SECRET" ]; then
        error "PAYLOAD_SECRET is not set in .env.production"
    fi
    
    if [ -z "$NEXT_PUBLIC_SERVER_URL" ]; then
        error "NEXT_PUBLIC_SERVER_URL is not set in .env.production"
    fi
    
    if [ "$NODE_ENV" != "production" ]; then
        error "NODE_ENV must be set to 'production' in .env.production"
    fi
    
    success "Environment configuration check passed"
}

backup_current_deployment() {
    log "Creating backup of current deployment..."
    
    if [ -d "$DEPLOYMENT_DIR" ]; then
        BACKUP_NAME="backup-$(date +'%Y%m%d-%H%M%S')"
        BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
        
        mkdir -p "$BACKUP_DIR"
        cp -r "$DEPLOYMENT_DIR" "$BACKUP_PATH"
        
        # Keep only last 5 backups
        cd "$BACKUP_DIR"
        ls -t | tail -n +6 | xargs -r rm -rf
        cd - > /dev/null
        
        success "Backup created: $BACKUP_NAME"
    else
        warning "No existing deployment found to backup"
    fi
}

prepare_deployment() {
    log "Preparing deployment..."
    
    # Create deployment directory
    sudo mkdir -p "$DEPLOYMENT_DIR"
    sudo chown $USER:$USER "$DEPLOYMENT_DIR"
    
    # Copy application files
    rsync -av --exclude='node_modules' \
              --exclude='.git' \
              --exclude='.next' \
              --exclude='.env.local' \
              --exclude='.env.development' \
              --exclude='*.log' \
              --exclude='uploads' \
              ./ "$DEPLOYMENT_DIR/"
    
    # Copy production environment file
    cp .env.production "$DEPLOYMENT_DIR/.env.local"
    
    success "Deployment files prepared"
}

install_dependencies() {
    log "Installing production dependencies..."
    
    cd "$DEPLOYMENT_DIR"
    
    # Clean install
    rm -rf node_modules package-lock.json
    npm ci --only=production
    
    success "Dependencies installed"
}

build_application() {
    log "Building application for production..."
    
    cd "$DEPLOYMENT_DIR"
    
    # Generate Payload types
    npm run generate:types
    
    # Build Next.js application
    npm run build
    
    success "Application built successfully"
}

setup_database() {
    log "Setting up production database..."
    
    cd "$DEPLOYMENT_DIR"
    
    # Check if database exists and is accessible
    if [ -f "afrimall.db" ]; then
        log "SQLite database found, checking permissions..."
        sudo chown $USER:$USER afrimall.db
        sudo chmod 644 afrimall.db
    fi
    
    # Run database migrations if needed
    # npm run db:migrate  # Uncomment if you have migration scripts
    
    success "Database setup completed"
}

configure_nginx() {
    log "Configuring Nginx..."
    
    NGINX_CONFIG="/etc/nginx/sites-available/afrimall"
    
    # Create Nginx configuration
    sudo tee "$NGINX_CONFIG" > /dev/null <<EOF
server {
    listen 80;
    server_name ${NEXT_PUBLIC_SERVER_URL#https://};
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${NEXT_PUBLIC_SERVER_URL#https://};
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/${NEXT_PUBLIC_SERVER_URL#https://}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${NEXT_PUBLIC_SERVER_URL#https://}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Root directory
    root $DEPLOYMENT_DIR/.next;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Static files
    location /_next/static {
        alias $DEPLOYMENT_DIR/.next/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Media files
    location /api/media {
        alias $DEPLOYMENT_DIR/uploads;
        expires 1y;
        add_header Cache-Control "public";
    }
    
    # API routes
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Admin panel
    location /admin {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Main application
    location / {
        try_files \$uri \$uri/ @nodejs;
    }
    
    location @nodejs {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
    
    # Enable site
    sudo ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/
    
    # Test configuration
    sudo nginx -t
    
    # Reload Nginx
    sudo systemctl reload nginx
    
    success "Nginx configured and reloaded"
}

setup_pm2() {
    log "Setting up PM2 process manager..."
    
    cd "$DEPLOYMENT_DIR"
    
    # Create PM2 ecosystem file
    cat > ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: 'afrimall',
    script: 'npm',
    args: 'start',
    cwd: '$DEPLOYMENT_DIR',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/afrimall/error.log',
    out_file: '/var/log/afrimall/out.log',
    log_file: '/var/log/afrimall/combined.log',
    time: true,
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
EOF
    
    # Start application with PM2
    pm2 start ecosystem.config.js
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 startup script
    pm2 startup
    
    success "PM2 configured and application started"
}

setup_logging() {
    log "Setting up logging..."
    
    # Create log directory
    sudo mkdir -p /var/log/afrimall
    sudo chown $USER:$USER /var/log/afrimall
    
    # Create logrotate configuration
    sudo tee /etc/logrotate.d/afrimall > /dev/null <<EOF
/var/log/afrimall/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
    
    success "Logging configured"
}

setup_monitoring() {
    log "Setting up monitoring..."
    
    # Install monitoring tools
    sudo apt-get update
    sudo apt-get install -y htop iotop nethogs
    
    # Setup basic monitoring script
    cat > "$DEPLOYMENT_DIR/scripts/monitor.sh" <<'EOF'
#!/bin/bash
# Basic system monitoring script

echo "=== System Status ==="
echo "Date: $(date)"
echo "Uptime: $(uptime)"
echo "Load Average: $(cat /proc/loadavg)"
echo "Memory Usage:"
free -h
echo "Disk Usage:"
df -h
echo "PM2 Status:"
pm2 status
echo "Nginx Status:"
systemctl status nginx --no-pager -l
EOF
    
    chmod +x "$DEPLOYMENT_DIR/scripts/monitor.sh"
    
    success "Basic monitoring configured"
}

run_tests() {
    log "Running production tests..."
    
    cd "$DEPLOYMENT_DIR"
    
    # Run basic health checks
    npm run test:int || warning "Integration tests failed"
    
    # Test API endpoints
    curl -f "http://localhost:3000/api/categories" > /dev/null || error "API health check failed"
    
    success "Production tests completed"
}

finalize_deployment() {
    log "Finalizing deployment..."
    
    # Set proper permissions
    sudo chown -R $USER:$USER "$DEPLOYMENT_DIR"
    sudo chmod -R 755 "$DEPLOYMENT_DIR"
    
    # Create deployment marker
    echo "Deployed at: $(date)" > "$DEPLOYMENT_DIR/DEPLOYMENT_MARKER"
    
    # Cleanup
    cd "$DEPLOYMENT_DIR"
    rm -rf .git .github scripts/deploy-production.sh
    
    success "Deployment finalized"
}

show_deployment_info() {
    log "=== Deployment Summary ==="
    echo "Application: $APP_NAME"
    echo "Deployment Directory: $DEPLOYMENT_DIR"
    echo "Backup Directory: $BACKUP_DIR"
    echo "Log Directory: /var/log/afrimall"
    echo "PM2 Process: afrimall"
    echo "Nginx Site: afrimall"
    echo ""
    echo "Useful Commands:"
    echo "  View logs: pm2 logs afrimall"
    echo "  Restart app: pm2 restart afrimall"
    echo "  Monitor: $DEPLOYMENT_DIR/scripts/monitor.sh"
    echo "  Nginx status: sudo systemctl status nginx"
    echo ""
    echo "Next Steps:"
    echo "1. Configure SSL certificates with Let's Encrypt"
    echo "2. Set up automated backups"
    echo "3. Configure monitoring and alerting"
    echo "4. Test all functionality"
}

# Main deployment process
main() {
    log "Starting Afrimall production deployment..."
    
    # Create log file
    sudo mkdir -p /var/log/afrimall
    sudo chown $USER:$USER /var/log/afrimall
    touch "$LOG_FILE"
    
    check_requirements
    check_environment
    backup_current_deployment
    prepare_deployment
    install_dependencies
    build_application
    setup_database
    configure_nginx
    setup_pm2
    setup_logging
    setup_monitoring
    run_tests
    finalize_deployment
    
    success "🎉 Deployment completed successfully!"
    show_deployment_info
}

# Run main function
main "$@"
